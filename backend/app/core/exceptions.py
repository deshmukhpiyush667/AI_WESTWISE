from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Union

class ImageProcessingError(HTTPException):
    def __init__(self, detail: str = "Invalid image file or format."):
        super().__init__(status_code=400, detail=detail)

class ModelInferenceError(HTTPException):
    def __init__(self, detail: str = "Error executing AI model prediction."):
        super().__init__(status_code=500, detail=detail)

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "status_code": exc.status_code,
                "message": exc.detail
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "status_code": 500,
                "message": "An unexpected server error occurred. Please try again."
            }
        }
    )
