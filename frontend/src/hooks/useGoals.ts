import { useState, useCallback } from 'react';
import { goalsApi } from '@/lib/api';

export function useGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await goalsApi.list();
      setGoals(data.data ?? data);
    } catch (e) {
      console.error('Failed to fetch goals', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getGoalDetails = useCallback(async (id: string) => {
    const [goalRes, progressRes] = await Promise.all([
      goalsApi.get(id),
      goalsApi.progress(id)
    ]);
    return {
      goal: goalRes.data.data ?? goalRes.data,
      progress: progressRes.data.data ?? progressRes.data
    };
  }, []);

  return {
    goals,
    loading,
    fetchGoals,
    getGoalDetails,
    createGoal: async (d: any) => { await goalsApi.create(d); fetchGoals(); },
    addContribution: async (id: string, d: any) => { await goalsApi.contribute(id, d); },
    inviteUser: async (id: string, inviteeId: string) => { await goalsApi.invite(id, inviteeId); }
  };
}
