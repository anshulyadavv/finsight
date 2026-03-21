"""
POST /predict
Monthly spending forecast using Facebook Prophet with ARIMA fallback.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.forecaster import ForecasterService

router = APIRouter()
_svc   = ForecasterService()


class TransactionRecord(BaseModel):
    date:     str           # YYYY-MM-DD
    type:     str           # 'income' | 'expense'
    amount:   float
    category: Optional[str] = None


class PredictRequest(BaseModel):
    transactions: list[TransactionRecord]


class CategoryForecast(BaseModel):
    category:         str
    projectedAmount:  float


class PredictResponse(BaseModel):
    projectedExpense:  float
    projectedIncome:   float
    projectedSavings:  float
    confidenceScore:   float
    method:            str
    budgetWarning:     bool
    categoryForecasts: list[CategoryForecast]
    nextMonthLabel:    str


@router.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    return _svc.forecast([t.dict() for t in req.transactions])
