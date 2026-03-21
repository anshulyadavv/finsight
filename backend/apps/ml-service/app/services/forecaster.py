"""
ForecasterService
1. Tries Facebook Prophet for monthly expense forecasting (best for seasonality).
2. Falls back to ARIMA via statsmodels if Prophet unavailable.
3. Final fallback: weighted moving average.
"""
import logging
from datetime import date, datetime
from calendar import month_name

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class ForecasterService:

    def forecast(self, transactions: list[dict]) -> dict:
        if not transactions:
            return self._empty_forecast()

        df = self._to_dataframe(transactions)
        expenses = df[df["type"] == "expense"]
        incomes  = df[df["type"] == "income"]

        monthly_expense = expenses.resample("MS", on="date")["amount"].sum()
        monthly_income  = incomes.resample("MS", on="date")["amount"].sum()

        if len(monthly_expense) < 2:
            return self._empty_forecast()

        # ── Forecast expenses ────────────────────────────────────────────────
        proj_expense, confidence, method = self._forecast_series(monthly_expense)
        proj_income,  _,          _      = self._forecast_series(monthly_income) \
            if len(monthly_income) >= 2 else (float(monthly_income.mean() or 0), 0.5, "mean")

        proj_savings = proj_income - proj_expense

        # ── Category breakdown ────────────────────────────────────────────────
        last_month    = monthly_expense.index.max()
        recent_cats   = expenses[expenses["date"].dt.to_period("M") == last_month.to_period("M")]
        cat_breakdown = (
            recent_cats.groupby("category")["amount"]
            .sum()
            .sort_values(ascending=False)
            .head(6)
        )
        category_forecasts = [
            {"category": cat, "projectedAmount": round(float(amt), 2)}
            for cat, amt in cat_breakdown.items()
        ]

        next_month = self._next_month_label()

        return {
            "projectedExpense":  round(proj_expense, 2),
            "projectedIncome":   round(proj_income, 2),
            "projectedSavings":  round(proj_savings, 2),
            "confidenceScore":   round(confidence, 4),
            "method":            method,
            "budgetWarning":     proj_expense > proj_income,
            "categoryForecasts": category_forecasts,
            "nextMonthLabel":    next_month,
        }

    # ── Private ───────────────────────────────────────────────────────────────

    def _forecast_series(self, series: pd.Series) -> tuple[float, float, str]:
        """Returns (forecast_value, confidence_score, method_name)."""

        # 1. Prophet
        try:
            return self._prophet_forecast(series)
        except Exception as e:
            logger.warning(f"Prophet failed: {e}")

        # 2. ARIMA
        try:
            return self._arima_forecast(series)
        except Exception as e:
            logger.warning(f"ARIMA failed: {e}")

        # 3. Weighted moving average
        return self._wma_forecast(series)

    def _prophet_forecast(self, series: pd.Series) -> tuple[float, float, str]:
        from prophet import Prophet  # type: ignore

        df = pd.DataFrame({
            "ds": series.index,
            "y":  series.values.astype(float),
        })
        model = Prophet(yearly_seasonality=False, weekly_seasonality=False,
                        daily_seasonality=False, interval_width=0.80)
        model.fit(df)

        future = model.make_future_dataframe(periods=1, freq="MS")
        forecast = model.predict(future)
        last     = forecast.iloc[-1]

        value      = max(0, float(last["yhat"]))
        lower      = max(0, float(last["yhat_lower"]))
        upper      = max(0, float(last["yhat_upper"]))
        spread     = upper - lower
        confidence = float(np.clip(1 - spread / (value + 1), 0.5, 0.95)) if value > 0 else 0.5

        return value, round(confidence, 4), "prophet"

    def _arima_forecast(self, series: pd.Series) -> tuple[float, float, str]:
        from statsmodels.tsa.arima.model import ARIMA  # type: ignore

        model = ARIMA(series.values.astype(float), order=(1, 1, 1))
        result = model.fit()
        forecast = result.forecast(steps=1)
        value = max(0, float(forecast[0]))
        conf  = 0.72
        return value, conf, "arima"

    def _wma_forecast(self, series: pd.Series) -> tuple[float, float, str]:
        vals    = series.values.astype(float)
        n       = len(vals)
        weights = np.arange(1, n + 1, dtype=float)
        wma     = float(np.dot(vals, weights) / weights.sum())
        # Simple trend adjustment
        if n >= 2:
            trend = (vals[-1] - vals[0]) / max(n - 1, 1)
            wma  += trend
        return max(0, wma), 0.60, "weighted_moving_average"

    @staticmethod
    def _to_dataframe(transactions: list[dict]) -> pd.DataFrame:
        rows = []
        for t in transactions:
            try:
                rows.append({
                    "date":     pd.to_datetime(t["date"]),
                    "type":     t["type"],
                    "amount":   float(t["amount"]),
                    "category": (t.get("category") or "Other").capitalize(),
                })
            except Exception:
                continue
        return pd.DataFrame(rows)

    @staticmethod
    def _next_month_label() -> str:
        d = date.today()
        month = d.month % 12 + 1
        year  = d.year + (1 if d.month == 12 else 0)
        return f"{month_name[month]} {year}"

    @staticmethod
    def _empty_forecast() -> dict:
        return {
            "projectedExpense":  0.0,
            "projectedIncome":   0.0,
            "projectedSavings":  0.0,
            "confidenceScore":   0.0,
            "method":            "insufficient_data",
            "budgetWarning":     False,
            "categoryForecasts": [],
            "nextMonthLabel":    ForecasterService._next_month_label(),
        }
