'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTCooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Plus, Users, Target, Zap } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AddContributionModal from '@/components/dashboard/AddContributionModal';

const fmt = (n: number) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

export default function GoalDetailPage({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  const id = (routeParams?.id as string) || params?.id || '';
  
  const { user } = useAuth();
  const { getGoalDetails, addContribution } = useGoals();
  
  const [data, setData] = useState<{ goal: any, progress: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContribModal, setShowContribModal] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getGoalDetails(id);
      setData(res);
    } catch {
      // handled in hook
    } finally {
      setLoading(false);
    }
  }, [id, getGoalDetails]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]);

  if (loading || !data) return <AppShell><div style={{ padding: 24 }}>Loading...</div></AppShell>;

  const { goal, progress } = data;
  
  // Dummy chart data representing trajectory based on progress
  const chartData = [
    { name: 'Start', value: 0 },
    { name: 'Current', value: progress.totalSaved },
    { name: 'Target', value: Number(goal.targetAmount) }
  ];

  return (
    <AppShell>
      <div style={{ padding: '20px 24px 0' }}>
        {/* Top Nav */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Link href="/goals" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
              <ArrowLeft size={16} />
            </div>
            Back to Goals
          </Link>
        </div>

        {/* Hero Section */}
        <div className="glass" style={{ padding: '30px', borderRadius: '24px', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={24} color="var(--accent)" />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>{goal.title}</h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--text3)', fontSize: '13px' }}>Target deadline: {new Date(goal.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
            
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowContribModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 24px', borderRadius: '50px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-dim)' }}>
              <Plus size={16} strokeWidth={2.5} /> Add Contribution
            </motion.button>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>Current Progress</div>
              <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{fmt(progress.totalSaved)}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text3)', paddingBottom: '3px' }}>/ {fmt(goal.targetAmount)}</div>
              </div>
            </div>
            
            <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
            
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>Completion</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent2)' }}>{progress.progressPercentage.toFixed(1)}%</div>
              </div>
            </div>

            {progress.projectedCompletionDate && (
              <>
                <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>Forecasted Completion</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                    <Zap size={16} />
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>{new Date(progress.projectedCompletionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '30px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min(progress.progressPercentage, 100)}%` }} 
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent2) 100%)', borderRadius: '4px' }} 
            />
          </div>
        </div>

        {/* Breakdown & Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
          
          {/* Chart */}
          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Trajectory</h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} />
                  <RTCooltip 
                    contentStyle={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                    formatter={(val: number) => fmt(val)}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Members / Contributions */}
          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Contributors</h3>
              <button style={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: '50%', padding: '6px', color: 'var(--text)', cursor: 'pointer' }}>
                <Users size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {goal.members.map((member: any) => {
                const isOwner = member.role === 'owner';
                const contributed = progress.contributionsByUser[member.userId] || 0;
                
                return (
                  <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--glass-strong)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                        {member.user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{member.user.name} {user?.id === member.userId && '(You)'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{isOwner ? 'Owner' : 'Contributor'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent2)' }}>
                      {fmt(contributed)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {showContribModal && <AddContributionModal onClose={() => setShowContribModal(false)} onSuccess={fetchDetails} goalId={id} />}
    </AppShell>
  );
}
