'use client';
import { useEffect, useState, useCallback } from 'react';
import { dashboardApi, insightsApi, anomaliesApi, predictionsApi } from '@/lib/api';

export function useDashboard(month?: string) {
  const [summary,    setSummary]    = useState<any>(null);
  const [overview,   setOverview]   = useState<any>(null);
  const [moneyFlow,  setMoneyFlow]  = useState<any[]>([]);
  const [wealth,     setWealth]     = useState<any>(null);
  const [insights,   setInsights]   = useState<any[]>([]);
  const [anomalies,  setAnomalies]  = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, o, mf, w, i, a, p] = await Promise.allSettled([
        dashboardApi.summary(month),
        dashboardApi.overview(month),
        dashboardApi.moneyFlow(6),
        dashboardApi.wealth(),
        insightsApi.list(),
        anomaliesApi.list(),
        predictionsApi.get(),
      ]);

      if (s.status === 'fulfilled') setSummary(s.value.data.data);
      if (o.status === 'fulfilled') setOverview(o.value.data.data);
      if (mf.status === 'fulfilled') setMoneyFlow(mf.value.data.data);
      if (w.status === 'fulfilled') setWealth(w.value.data.data);
      if (i.status === 'fulfilled') setInsights(i.value.data.data);
      if (a.status === 'fulfilled') setAnomalies(a.value.data.data);
      if (p.status === 'fulfilled') setPrediction(p.value.data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { summary, overview, moneyFlow, wealth, insights, anomalies, prediction, loading, error, refetch: fetchAll };
}
