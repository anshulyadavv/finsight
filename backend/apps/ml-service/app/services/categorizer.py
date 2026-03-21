"""
CategoriserService
Hybrid: tries a trained LightGBM model first, falls back to keyword rules.
Train by calling .train(texts, labels) and then .save().
"""
import os, re, logging, joblib
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# ── Keyword map (mirrors the NestJS rule engine) ──────────────────────────────
KEYWORD_MAP: dict[str, list[str]] = {
    "Food":          ["swiggy","zomato","dominos","pizza","mcdonald","kfc","subway",
                      "burger","cafe","restaurant","hotel","dhaba","biryani","starbucks",
                      "chaayos","haldiram","amul","dunkin"],
    "Transport":     ["uber","ola","rapido","metro","irctc","makemytrip","goibibo",
                      "petrol","diesel","bpcl","hpcl","fuel","fastag","parking",
                      "cab","auto","train","flight","air india"],
    "Shopping":      ["amazon","flipkart","myntra","ajio","nykaa","meesho","snapdeal",
                      "reliance","bigbasket","blinkit","zepto","instamart","dmart",
                      "lifestyle","shoppers stop","westside"],
    "Housing":       ["rent","housing","nobroker","maintenance","society","property"],
    "Health":        ["apollo","medplus","netmeds","pharmeasy","1mg","practo","cure.fit",
                      "gym","fitness","hospital","clinic","pharmacy","medicine","doctor",
                      "healthify","cult"],
    "Entertainment": ["netflix","hotstar","prime video","sony liv","zee5","jio cinema",
                      "spotify","gaana","youtube","game","pvr","inox","cinepolis",
                      "book my show"],
    "Utilities":     ["airtel","jio","vodafone","vi ","bsnl","tata sky","dish tv",
                      "tata power","bescom","electricity","broadband","wifi","recharge",
                      "dth","postpaid"],
    "Education":     ["byju","unacademy","vedantu","coursera","udemy","upgrad",
                      "duolingo","coaching","tuition"],
    "Finance":       ["emi","loan","insurance","lic","mutual fund","sip","zerodha",
                      "groww","upstox","credit card","tax","gst"],
}

MODEL_PATH = Path(os.getenv("MODEL_DIR", "/tmp/finiq_models")) / "categorizer.joblib"


class CategoriserService:
    def __init__(self):
        self._model: Any | None = None
        self._vectorizer: Any | None = None
        self._classes: list[str] = []
        self._load_model()

    # ── Public API ────────────────────────────────────────────────────────────

    def predict(self, text: str) -> dict:
        text_clean = self._clean(text)

        # 1. Try ML model
        if self._model is not None:
            try:
                return self._ml_predict(text_clean)
            except Exception as e:
                logger.warning(f"ML predict failed: {e}, falling back to rules")

        # 2. Rule-based fallback
        return self._rule_predict(text_clean)

    def train(self, texts: list[str], labels: list[str]) -> dict:
        """Train or re-train the TF-IDF + LightGBM pipeline."""
        try:
            from sklearn.pipeline import Pipeline
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.preprocessing import LabelEncoder
            import lightgbm as lgb

            cleaned = [self._clean(t) for t in texts]
            le = LabelEncoder()
            y  = le.fit_transform(labels)

            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=10000)),
                ("clf",   lgb.LGBMClassifier(n_estimators=200, learning_rate=0.05,
                                              class_weight="balanced", random_state=42)),
            ])
            pipeline.fit(cleaned, y)

            MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump({"pipeline": pipeline, "classes": le.classes_.tolist()}, MODEL_PATH)
            self._load_model()

            logger.info(f"Model trained on {len(texts)} samples, {len(le.classes_)} classes")
            return {"status": "trained", "samples": len(texts), "classes": len(le.classes_)}

        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise

    # ── Private helpers ───────────────────────────────────────────────────────

    def _load_model(self):
        if MODEL_PATH.exists():
            try:
                data = joblib.load(MODEL_PATH)
                self._model   = data["pipeline"]
                self._classes = data["classes"]
                logger.info("Categorizer model loaded from disk")
            except Exception as e:
                logger.warning(f"Could not load model: {e}")

    def _ml_predict(self, text: str) -> dict:
        proba: np.ndarray = self._model.predict_proba([text])[0]
        idx        = int(np.argmax(proba))
        confidence = float(proba[idx])
        category   = self._classes[idx]
        return {"category": category, "confidence": round(confidence, 4), "method": "ml"}

    def _rule_predict(self, text: str) -> dict:
        for category, keywords in KEYWORD_MAP.items():
            for kw in keywords:
                if kw in text:
                    return {"category": category, "confidence": 0.82, "method": "rule"}
        return {"category": "Other", "confidence": 0.30, "method": "fallback"}

    @staticmethod
    def _clean(text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text
