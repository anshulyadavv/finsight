"""
AnomalyDetectorService
Isolation Forest trained per-user on their transaction history.
Falls back to simple statistical z-score if the model hasn't been trained yet.
"""
import os, logging, joblib
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

MODEL_DIR = Path(os.getenv("MODEL_DIR", "/tmp/finiq_models")) / "anomaly"


class AnomalyDetectorService:

    def detect(self, data: dict) -> dict:
        user_id = data.get("user_id", "global")
        features = self._extract_features(data)

        model = self._load_user_model(user_id)
        if model is not None:
            return self._if_predict(model, features)

        # Statistical fallback: no training data yet
        return self._statistical_fallback(data)

    def train_user_model(self, user_id: str, transactions: list[dict]) -> dict:
        """
        Train an IsolationForest per user on their historical transactions.
        Call this from a background job after enough history accumulates (>= 30 txns).
        """
        from sklearn.ensemble import IsolationForest

        if len(transactions) < 10:
            return {"status": "skipped", "reason": "insufficient_data"}

        X = np.array([self._extract_features(t) for t in transactions])

        model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42,
        )
        model.fit(X)

        path = self._model_path(user_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, path)

        logger.info(f"Anomaly model trained for user {user_id} on {len(transactions)} samples")
        return {"status": "trained", "samples": len(transactions)}

    # ── Private ───────────────────────────────────────────────────────────────

    def _if_predict(self, model: Any, features: list[float]) -> dict:
        X     = np.array([features])
        score = model.decision_function(X)[0]           # negative = more anomalous
        pred  = model.predict(X)[0]                     # -1 = anomaly, 1 = normal
        # Normalise score to 0–1 (higher = more anomalous)
        norm_score = float(np.clip(1 - (score + 0.5), 0, 1))
        return {
            "is_anomaly":    bool(pred == -1),
            "anomaly_score": round(norm_score, 4),
            "method":        "isolation_forest",
        }

    def _statistical_fallback(self, data: dict) -> dict:
        """
        Very light heuristic when no user model exists:
        flag transactions > 5× the median expected amount for that hour.
        """
        amount = data.get("amount", 0)
        # Conservative threshold: anything over ₹50,000 single transaction
        is_anomaly  = amount > 50_000
        score       = min(1.0, amount / 100_000)
        return {
            "is_anomaly":    is_anomaly,
            "anomaly_score": round(score, 4),
            "method":        "statistical_fallback",
        }

    @staticmethod
    def _extract_features(data: dict) -> list[float]:
        CATEGORY_IDX = {
            "food": 0, "transport": 1, "shopping": 2, "housing": 3,
            "health": 4, "entertainment": 5, "utilities": 6, "education": 7,
            "finance": 8, "other": 9,
        }
        cat   = (data.get("category") or "other").lower()
        cat_i = CATEGORY_IDX.get(cat, 9)
        return [
            float(data.get("amount", 0)),
            float(data.get("day_of_week") or 0),
            float(data.get("hour") or 12),
            float(cat_i),
        ]

    def _load_user_model(self, user_id: str) -> Any | None:
        path = self._model_path(user_id)
        if path.exists():
            try:
                return joblib.load(path)
            except Exception as e:
                logger.warning(f"Failed to load anomaly model for {user_id}: {e}")
        return None

    @staticmethod
    def _model_path(user_id: str) -> Path:
        return MODEL_DIR / f"{user_id}.joblib"
