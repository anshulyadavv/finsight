import { useState, useCallback } from 'react';
import { assetsApi } from '@/lib/api';

export function useAssets() {
  const [netWorthData, setNetWorthData] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [incomeSources, setIncomeSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nwRes, aRes, lRes, iRes] = await Promise.all([
        assetsApi.getNetWorth(),
        assetsApi.getAssets(),
        assetsApi.getLiabilities(),
        assetsApi.getIncomeSources()
      ]);
      setNetWorthData(nwRes.data.data ?? nwRes.data);
      setAssets(aRes.data.data ?? aRes.data);
      setLiabilities(lRes.data.data ?? lRes.data);
      setIncomeSources(iRes.data.data ?? iRes.data);
    } catch (e) {
      console.error('Failed to fetch assets data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    netWorthData,
    assets,
    liabilities,
    incomeSources,
    loading,
    fetchAll,
    createAsset: async (d: any) => { await assetsApi.createAsset(d); fetchAll(); },
    updateAsset: async (id: string, d: any) => { await assetsApi.updateAsset(id, d); fetchAll(); },
    deleteAsset: async (id: string) => { await assetsApi.deleteAsset(id); fetchAll(); },
    createLiability: async (d: any) => { await assetsApi.createLiability(d); fetchAll(); },
    updateLiability: async (id: string, d: any) => { await assetsApi.updateLiability(id, d); fetchAll(); },
    deleteLiability: async (id: string) => { await assetsApi.deleteLiability(id); fetchAll(); },
    createIncomeSource: async (d: any) => { await assetsApi.createIncomeSource(d); fetchAll(); },
    updateIncomeSource: async (id: string, d: any) => { await assetsApi.updateIncomeSource(id, d); fetchAll(); },
    deleteIncomeSource: async (id: string) => { await assetsApi.deleteIncomeSource(id); fetchAll(); },
  };
}
