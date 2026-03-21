"""
POST /categorize
Classifies a transaction description into a spending category.
Uses TF-IDF + LightGBM. Falls back to keyword rules if model unavailable.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.categorizer import CategoriserService

router = APIRouter()
_svc   = CategoriserService()

class CategorizeRequest(BaseModel):
    description: str

class CategorizeResponse(BaseModel):
    category:   str
    confidence: float
    method:     str   # "ml" | "rule" | "fallback"

@router.post("/categorize", response_model=CategorizeResponse)
async def categorize(req: CategorizeRequest):
    result = _svc.predict(req.description)
    return result
