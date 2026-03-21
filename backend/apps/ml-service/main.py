"""
FinIQ ML Microservice
FastAPI service exposing categorization, anomaly detection, and spending prediction.
"""
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from app.routes.categorize  import router as categorize_router
from app.routes.anomaly     import router as anomaly_router
from app.routes.predict     import router as predict_router
from app.routes.health      import router as health_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("finiq-ml")

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="FinIQ ML Service",
    description="NLP categorization, anomaly detection (Isolation Forest + Z-score), and ARIMA/Prophet forecasting.",
    version="1.0.0",
    docs_url="/docs",
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Key guard ──────────────────────────────────────────────────────────────

API_KEY        = os.getenv("ML_API_KEY", "ml-internal-key")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(key: str = Security(api_key_header)):
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(health_router)
app.include_router(categorize_router,  prefix="", dependencies=[Depends(verify_api_key)])
app.include_router(anomaly_router,     prefix="", dependencies=[Depends(verify_api_key)])
app.include_router(predict_router,     prefix="", dependencies=[Depends(verify_api_key)])
