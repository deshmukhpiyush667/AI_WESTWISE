import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.models.classification import ClassificationRecord
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageItem,
    ChatResponse,
    ChatStatusResponse,
)
from app.services.chat_service import generate_chat_response, get_llm_status

router = APIRouter()

@router.get("/status", response_model=ChatStatusResponse)
def get_chat_provider_status():
    """
    Returns whether a live LLM provider (Gemini or OpenAI) is active or
    if the system is running in transparent Offline Knowledge Base mode.
    """
    status_info = get_llm_status()
    return ChatStatusResponse(**status_info)

@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def post_chat_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Sends a message to the WasteWise AI Assistant.
    If authenticated, links message to the user account.
    If referencing a recent scan, injects real classification metadata.
    """
    # Generate session_id if none provided
    session_id = payload.session_id or str(uuid.uuid4())

    # Look up referenced scan if specified
    scan_context = None
    if payload.recent_scan_id:
        record = db.query(ClassificationRecord).filter(ClassificationRecord.id == payload.recent_scan_id).first()
        if record:
            guidance_text = ""
            bin_color = "Standard"
            if record.disposal_guidance and isinstance(record.disposal_guidance, dict):
                bin_color = record.disposal_guidance.get("bin_color", "Standard")
                instructions = record.disposal_guidance.get("disposal_instructions", [])
                guidance_text = " ".join(instructions) if isinstance(instructions, list) else str(instructions)
            
            scan_context = {
                "id": record.id,
                "predicted_class": record.predicted_class,
                "confidence": record.confidence,
                "bin_color": bin_color,
                "guidance": guidance_text,
                "is_uncertain": record.is_uncertain,
            }

    # Fetch recent conversation context for this session/user
    history_query = db.query(ChatMessage).filter(ChatMessage.session_id == session_id)
    if current_user:
        history_query = db.query(ChatMessage).filter(
            (ChatMessage.session_id == session_id) | (ChatMessage.user_id == current_user.id)
        )
    recent_history = history_query.order_by(ChatMessage.created_at.desc()).limit(6).all()
    recent_history.reverse()

    # Generate response
    reply_text, is_live_ai, provider_name, offline_notice = await generate_chat_response(
        message=payload.message,
        recent_scan_context=scan_context,
        conversation_history=recent_history,
    )

    # Persist user turn
    user_msg = ChatMessage(
        user_id=current_user.id if current_user else None,
        session_id=session_id,
        role="user",
        content=payload.message,
        is_live_ai=False,
        referenced_scan_id=payload.recent_scan_id,
    )
    db.add(user_msg)

    # Persist assistant turn
    assistant_msg = ChatMessage(
        user_id=current_user.id if current_user else None,
        session_id=session_id,
        role="assistant",
        content=reply_text,
        is_live_ai=is_live_ai,
        referenced_scan_id=payload.recent_scan_id,
    )
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(
        response=reply_text,
        role="assistant",
        is_live_ai=is_live_ai,
        provider=provider_name,
        offline_notice=offline_notice,
        session_id=session_id,
        referenced_scan=scan_context,
    )

@router.get("/history", response_model=List[ChatMessageItem])
def get_chat_history(
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieves previous chat turns for the authenticated user or session.
    """
    if current_user:
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == current_user.id)
            .order_by(ChatMessage.created_at.asc())
            .limit(100)
            .all()
        )
        return messages
    elif session_id:
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .limit(50)
            .all()
        )
        return messages

    return []

@router.delete("/history")
def clear_chat_history(
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Clears the chat conversation history.
    """
    if current_user:
        db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
        db.commit()
        return {"success": True, "message": "User conversation history cleared."}
    elif session_id:
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        db.commit()
        return {"success": True, "message": "Session conversation history cleared."}

    return {"success": True, "message": "No session or user specified."}
