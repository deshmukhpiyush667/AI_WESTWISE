import os
import re
import logging
from typing import Optional, Tuple, Dict, Any
from app.config import settings
from app.core.guidance import CATEGORIES_INFO

logger = logging.getLogger("WasteWiseChat")

SYSTEM_PROMPT = """You are the WasteWise AI Assistant, an expert, friendly, and practical guide for household and municipal waste segregation, recycling, and sustainable living.

Core Project Capabilities & Knowledge:
- AI WasteWise is an automated waste management system using MobileNetV3 transfer learning trained on the Merged Waste Classification Dataset (MWCD).
- Supported 6 categories:
  1. Organic (Green Bin): Vegetable peels, food scraps, garden waste, tea leaves. Diverting from landfills cuts methane.
  2. Plastic (Blue Bin): Rigid containers (PET #1, HDPE #2, PP #5). Rinse clean, flatten bottles, keep caps screwed on. Avoid film bags and styrofoam in curbside bins.
  3. Paper (Blue Bin): Clean cardboard boxes, printer sheets, newspapers. Must be kept clean and dry; greasy pizza boxes cannot be recycled.
  4. Metal (Yellow Bin): Aluminum soda cans, tin food cans. Rinse residue, push sharp lids inside. Aluminum is 100% recyclable indefinitely.
  5. Glass (Glass Bin): Glass jars and bottles. Rinse clean; remove metal lids. Never place broken glass, window panes, or ceramics in container bins.
  6. E-Waste (Special Drop-Off): Electronics, chargers, batteries, circuit boards. NEVER throw in curbside trash due to fire hazard and heavy metal toxicity (lead/mercury/cadmium). Take to certified depositories.
- Model Performance: 90.65% held-out test accuracy on 1,080 unseen images, 0.2868 test loss.
- Softmax confidence threshold is 60%. Below 60%, the system flags an "Uncertain Prediction" to prevent false certainty.

Instructions:
- Keep answers practical, encouraging, and formatted with clean bullet points or numbered steps.
- Explain the "why" (environmental benefits, e.g., energy/water savings) briefly.
- Never fabricate local collection addresses, phone numbers, or unverified recycling regulations.
- If asked about a user's recent scan, explain the predicted category and disposal instructions using the provided scan details without claiming 100% certainty.
- If asked off-topic questions (e.g. coding, politics, general trivia unrelated to waste, sustainability, or the app), politely decline and remind the user that you specialize in waste segregation, recycling, and sustainable environmental practices.
"""

# Grounded offline answers for core questions when no API key is provided
OFFLINE_KNOWLEDGE_BASE = [
    {
        "keywords": ["plastic", "pet", "bottle", "polymer"],
        "answer": (
            "**How to Recycle Plastic Responsibly:**\n\n"
            "1. **Check SPI Codes:** Most municipal programs readily accept #1 (PET - clear water bottles) and #2 (HDPE - milk jugs & shampoo bottles). Rigid #5 (PP - yogurt tubs) is also frequently recyclable.\n"
            "2. **Empty & Rinse:** Give bottles and tubs a quick rinse to remove food or sugary liquids. They do not need to be dishwasher-clean, just free of grease.\n"
            "3. **Flatten & Cap:** Crush plastic bottles to save bin room and screw the plastic caps back on so they don't fall through sorting grates.\n"
            "4. **What to Keep Out:** Do NOT put thin plastic grocery bags, bubble wrap, chip bags, or Styrofoam into standard recycling bins—these tangle sorting machinery.\n\n"
            "💡 *Impact: Recycling 1 ton of plastic saves approximately 5,774 kWh of electricity and 16.3 barrels of petroleum oil.*"
        ),
    },
    {
        "keywords": ["biodegradable", "organic", "compost", "food", "kitchen", "wet waste"],
        "answer": (
            "**Understanding Organic & Biodegradable Waste:**\n\n"
            "Organic waste includes natural, biodegradable materials that decompose into nutrient-rich compost:\n\n"
            "- **Accepted Items:** Fruit and vegetable peels, coffee grounds, staple-free tea bags, eggshells, leftover cooked rice/breads, and trimmed leaves/grass.\n"
            "- **Proper Bin:** Always deposit in the **Green Bin** (Compost / Wet Waste).\n"
            "- **Best Practice:** Drain excess sauces/liquids before discarding to minimize bin odors and vector breeding.\n"
            "- **What to Avoid:** Keep pet waste, treated wood, heavy cooking oils, and non-certified plastic bags out of composting piles.\n\n"
            "🌱 *Environmental Benefit: Diverting food waste from landfills prevents the generation of methane gas, which is 28x more potent than CO2.*"
        ),
    },
    {
        "keywords": ["battery", "batteries", "e-waste", "electronics", "laptop", "phone", "circuit"],
        "answer": (
            "**Safe E-Waste & Battery Disposal Protocol:**\n\n"
            "⚠️ **Crucial Rule:** NEVER toss batteries or electronic apparatus into regular domestic or curbside trash bins!\n\n"
            "1. **Fire & Chemical Hazard:** Lithium-ion batteries can short-circuit, catch fire, or release toxic lead, mercury, and cadmium into groundwater.\n"
            "2. **Safety Preparation:** Tape the conductive metal terminals of loose batteries using electrical tape.\n"
            "3. **Certified Depositories:** Take laptops, chargers, cell phones, and batteries to an authorized municipal e-waste drop-off center or hardware retailer with a take-back kiosk.\n"
            "4. **Find a Center:** Use our **Center Locator** tab to find verified e-waste collection hubs near you.\n\n"
            "📱 *Resource Recovery: Recycling 1 million cell phones recovers 35,000 lbs of copper and 75 lbs of pure gold.*"
        ),
    },
    {
        "keywords": ["segregation", "separate", "how does waste segregation", "sorting"],
        "answer": (
            "**How Waste Segregation Works (The 3-Stream Principle):**\n\n"
            "Segregation means separating items at the source so recyclables are not contaminated by wet organic matter:\n\n"
            "1. **Green Bin (Wet / Organic):** Biodegradable food scraps, fruit peels, and garden cuttings for composting.\n"
            "2. **Blue Bin (Dry Recyclables):** Clean paper, cardboard, rigid plastic bottles, and metal cans.\n"
            "3. **Specialized / Red (Hazardous & E-Waste):** Batteries, electronics, and chemicals.\n\n"
            "✨ *Why It Matters: Mixing a single oily takeout container into a paper bin can spoil entire bales of pulp, forcing them into landfills.*"
        ),
    },
    {
        "keywords": ["reduce", "household waste", "zero waste", "less waste", "tips"],
        "answer": (
            "**Top 5 Practical Ways to Reduce Household Waste:**\n\n"
            "1. **Ditch Single-Use Plastics:** Carry reusable cloth grocery bags, a stainless steel water bottle, and reusable coffee mugs.\n"
            "2. **Meal Planning & Storage:** Buy groceries with a list to reduce food spoilage, and compost organic scraps at home.\n"
            "3. **Buy in Bulk:** Choose family-sized or refillable pantry goods to eliminate redundant miniature packaging.\n"
            "4. **Repair Before Replacing:** Fix electronics and mend garments before buying new items.\n"
            "5. **Use AI WasteWise:** Scan tricky items before tossing them so you always select the right bin and earn eco-points!"
        ),
    },
    {
        "keywords": ["wastewise", "accuracy", "model", "features", "how does this app work", "mobilenet"],
        "answer": (
            "**About AI WasteWise:**\n\n"
            "AI WasteWise is an intelligent waste classification and management system:\n\n"
            "- **Deep Neural Model:** Powered by **MobileNetV3 transfer learning** fine-tuned on the Merged Waste Classification Dataset (MWCD).\n"
            "- **Verified Performance:** Tested on 1,080 unseen test images with **90.65% top-1 accuracy** and **0.2868 test loss** (average CPU latency ~28ms).\n"
            "- **6 Core Classes:** Organic, Plastic, Paper, Metal, Glass, and E-Waste.\n"
            "- **Uncertainty Guard:** Prompts caution whenever confidence falls below 60%.\n"
            "- **Gamification:** Earn +10 eco-points for recorded scans, complete weekly eco-challenges, unlock badges, and find local recycling centers."
        ),
    },
]

def get_llm_status() -> Dict[str, Any]:
    """Returns the operational status of available LLM providers."""
    if settings.GEMINI_API_KEY:
        return {
            "provider_configured": True,
            "provider_name": "Google Gemini",
            "model_name": settings.GEMINI_MODEL,
            "offline_mode": False,
            "setup_help": "Live Gemini AI model active.",
        }
    elif settings.OPENAI_API_KEY:
        return {
            "provider_configured": True,
            "provider_name": "OpenAI",
            "model_name": settings.OPENAI_MODEL,
            "offline_mode": False,
            "setup_help": "Live OpenAI model active.",
        }
    else:
        return {
            "provider_configured": False,
            "provider_name": "Offline Knowledge Base",
            "model_name": "wastewise-domain-expert-v1",
            "offline_mode": True,
            "setup_help": (
                "To activate live Gemini conversational AI, obtain a free API key from "
                "https://aistudio.google.com and set GEMINI_API_KEY=your_key in backend/.env"
            ),
        }

async def generate_chat_response(
    message: str,
    recent_scan_context: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[list] = None
) -> Tuple[str, bool, str, Optional[str]]:
    """
    Generates a contextual response to a user waste query.
    Returns: (response_text, is_live_ai, provider_name, offline_notice)
    """
    clean_msg = message.strip()
    status = get_llm_status()

    # Prepend recent scan context if provided by client
    context_str = ""
    if recent_scan_context:
        context_str = (
            f"\n[USER RECENT SCAN CONTEXT: The user is referencing their scan of "
            f"category '{recent_scan_context.get('predicted_class')}' with "
            f"{int(recent_scan_context.get('confidence', 0) * 100)}% model confidence. "
            f"Recommended Bin: {recent_scan_context.get('bin_color', 'Standard')} Bin. "
            f"Guidance: {recent_scan_context.get('guidance', 'N/A')}]\n"
        )

    # 1. LIVE GEMINI PROVIDER
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Build full prompt
            full_prompt = f"{SYSTEM_PROMPT}\n{context_str}\nUser Question: {clean_msg}"
            
            # Primary model with automatic fallback if temporary capacity spike occurs
            models_to_try = [settings.GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-pro-latest"]
            for model_candidate in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=model_candidate,
                        contents=full_prompt,
                    )
                    if response and response.text:
                        return (response.text.strip(), True, f"Google Gemini", None)
                except Exception as candidate_err:
                    logger.warning(f"Gemini {model_candidate} issue: {candidate_err}. Attempting candidate model...")
                    continue
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}. Falling back to domain knowledge base.")
            # Fall through to offline fallback with note

    # 2. LIVE OPENAI PROVIDER (ALTERNATIVE)
    elif settings.OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if context_str:
                messages.append({"role": "system", "content": context_str})
            messages.append({"role": "user", "content": clean_msg})

            resp = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.5,
                max_tokens=600,
            )
            reply = resp.choices[0].message.content
            return (reply.strip(), True, "OpenAI", None)
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}. Falling back to domain knowledge base.")

    # 3. GROUNDED OFFLINE KNOWLEDGE-BASE FALLBACK
    # Explicit notice as mandated: do not pretend an actual AI model is connected without credentials
    offline_notice = (
        "Operating in Offline Knowledge Base mode. To connect live generative AI, "
        "add your free GEMINI_API_KEY to backend/.env."
    )

    # Handle scan explanation request directly
    msg_lower = clean_msg.lower()
    if recent_scan_context and any(w in msg_lower for w in ["scan", "last", "latest", "classified", "my item"]):
        category = recent_scan_context.get("predicted_class", "Item")
        confidence = int(recent_scan_context.get("confidence", 0) * 100)
        bin_color = recent_scan_context.get("bin_color", "designated")
        guidance = recent_scan_context.get("guidance", "Follow standard municipal recycling steps.")

        reply = (
            f"**Explanation of Your Recent Scan:**\n\n"
            f"Our MobileNetV3 deep learning model classified your item as **{category}** with a confidence score of **{confidence}%**.\n\n"
            f"📌 **Target Destination:** Please deposit this in the **{bin_color} Bin**.\n\n"
            f"📋 **Handling Protocol:** {guidance}\n\n"
            f"⚠️ *Note: Neural network confidence scores represent pattern similarity with the training dataset and should always be verified by checking physical recyclability marks (e.g. SPI codes 1-7).*"
        )
        return (reply, False, "Offline Knowledge Base", offline_notice)

    # Search knowledge base for keyword matches
    for entry in OFFLINE_KNOWLEDGE_BASE:
        if any(kw in msg_lower for kw in entry["keywords"]):
            return (entry["answer"], False, "Offline Knowledge Base", offline_notice)

    # Off-topic / generic domain fallback
    is_off_topic = any(
        w in msg_lower for w in [
            "code", "python", "javascript", "stock", "crypto", "politics", "president",
            "movie", "song", "lyrics", "recipe for cake", "dating", "sports score"
        ]
    )
    if is_off_topic:
        reply = (
            "I'm specifically specialized in **waste management, recycling, composting, and sustainable disposal**. "
            "I'm unable to help with general topics like politics, entertainment, or software coding. "
            "Feel free to ask me anything about how to sort materials, handle e-waste, or how AI WasteWise works!"
        )
    else:
        reply = (
            f"**WasteWise Disposal Advisory for '{clean_msg[:40]}...':**\n\n"
            f"For most household items, follow the **Clean, Dry, and Separated** rule:\n"
            f"- **Dry Recyclables (Plastic, Paper, Metal, Glass):** Clean of food grease and deposited in Blue, Yellow, or Glass bins.\n"
            f"- **Organic / Wet:** Food scraps and vegetable trimmings belong in the Green composting bin.\n"
            f"- **Hazardous / Batteries:** Must go to designated e-waste drop-off kiosks.\n\n"
            f"💡 *Tip: You can use our **Classify** tab to take a photo of this item for automated MobileNetV3 identification!*"
        )

    return (reply, False, "Offline Knowledge Base", offline_notice)
