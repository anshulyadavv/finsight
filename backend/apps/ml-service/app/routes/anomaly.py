"""
POST /detect-anomaly
Isolation Forest anomaly detection on transaction features.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.anomaly_detector import AnomalyDetectorService

router = APIRouter()
_svc   = AnomalyDetectorService()


class AnomalyRequest(BaseModel):
    user_id:     str
    amount:      float
    category:    Optional[str] = None
    merchant:    Optional[str] = None
    day_of_week: Optional[int] = None   # 0=Mon … 6=Sun
    hour:        Optional[int] = None


class AnomalyResponse(BaseModel):
    is_anomaly:    bool
    anomaly_score: float          # 0.0 – 1.0  (higher = more anomalous)
    method:        str


@router.post("/detect-anomaly", response_model=AnomalyResponse)
async def detect_anomaly(req: AnomalyRequest):
    return _svc.detect(req.dict())
