'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Download, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { anomaliesApi, insightsApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import {
  IncomeCard, StrategyCard, OverviewCard, MoneyFlowCard,
  FinancesCard, WealthCard, InsightsCard, AnomalyCard, PredictionCard,
} from '@/components/dashboard/Cards';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState('Dashboard');
  const [showModal, setShowModal]   = useState(false);
  const [month,     setMonth]       = useState<string | undefined>();

  const { summary, overview, moneyFlow, wealth, insights, anomalies, prediction, loading, refetch } = useDashboard(month);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleResolveAnomaly = async (id: string) => {
    await anomaliesApi.resolve(id);
    refetch();
  };

  const handleDismissInsight = async (id: string) => {
    await insightsApi.dismiss(id);
    refetch();
  };

  if (authLoading || !user) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)' }}>
      <div style={{ fontSize:'14px',color:'var(--text3)' }}>Loading FinSight...</div>
    </div>
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab}/>

      {/* Page Header */}
      <motion.div
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 24px 20px' }}
      >
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700, letterSpacing:'-0.5px' }}>
            {getGreeting()}, {user.name.split(' ')[0]} ☀️
          </h1>
          <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>{dateStr}</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          {/* Month filter */}
          <input
            type="month"
            value={month || ''}
            onChange={e => setMonth(e.target.value || undefined)}
            style={{ padding:'8px 14px', borderRadius:'50px', border:'1px solid rgba(0,0,0,0.1)', background:'#fff', fontSize:'13px', fontFamily:'inherit', boxShadow:'6px 6px 16px rgba(0,0,0,0.06)', outline:'none', cursor:'pointer', color:'var(--text)' }}
          />
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 18px',borderRadius:'50px',background:'#fff',color:'var(--text)',border:'1px solid rgba(0,0,0,0.06)',boxShadow:'6px 6px 16px rgba(0,0,0,0.06)',fontSize:'13.5px',fontWeight:500,cursor:'pointer',fontFamily:'inherit' }}>
            <Download size={14}/> Export
          </motion.button>
          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowModal(true)}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 20px',borderRadius:'50px',background:'var(--teal)',color:'#fff',border:'none',boxShadow:'0 4px 16px rgba(15,118,110,0.35)',fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
            <Plus size={14}/> Add Expense
          </motion.button>
        </div>
      </motion.div>

      {/* ── 4-column grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.45fr 1fr 1fr', gap:'16px', padding:'0 24px 24px' }}>

        {/* COL 1 */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <IncomeCard summary={summary} moneyFlow={moneyFlow} loading={loading}/>
          <StrategyCard moneyFlow={moneyFlow} loading={loading}/>
        </div>

        {/* COL 2 */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <OverviewCard overview={overview} summary={summary} loading={loading}/>
          <MoneyFlowCard moneyFlow={moneyFlow} loading={loading}/>
        </div>

        {/* COL 3 */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <FinancesCard user={user}/>
          <WealthCard wealth={wealth} loading={loading}/>
          <InsightsCard insights={insights} loading={loading} onDismiss={handleDismissInsight}/>
        </div>

        {/* COL 4 */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <AnomalyCard anomalies={anomalies} loading={loading} onResolve={handleResolveAnomaly}/>
          <PredictionCard prediction={prediction} loading={loading}/>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} onSuccess={refetch}/>}
    </div>
  );
}
