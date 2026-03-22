'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus } from 'lucide-react';
import { MonthPicker } from '@/components/ui/DatePicker';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { anomaliesApi, insightsApi, txApi } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
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
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [month,     setMonth]     = useState<string | undefined>();

  const { summary, overview, moneyFlow, wealth, insights, anomalies, prediction, loading, refetch } = useDashboard(month);

  const handleExport = async () => {
    try {
      const params: any = { limit: 1000, sortBy: 'date', sortOrder: 'DESC' };
      if (month) params.month = month;
      const { data } = await txApi.list(params);
      const txs: any[] = data.data.items || [];
      if (!txs.length) { alert('No transactions to export for this period.'); return; }

      const headers = ['Date','Description','Merchant','Type','Category','Amount','Payment Method'];
      const rows = txs.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.description || '',
        t.merchant || '',
        t.type,
        t.category?.name || '',
        t.amount,
        t.paymentMethod || '',
      ]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type:'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `finsight-transactions-${month || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed. Please try again.'); }
  };

  const now   = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <AppShell>
      <div style={{ padding:'20px 24px 0' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <h1 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.5px', color:'var(--text)', margin:0 }}>
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'3px' }}>{dateStr}</p>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <MonthPicker value={month} onChange={setMonth}/>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleExport}
              style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 18px',borderRadius:'50px',background:'var(--glass)',color:'var(--text)',border:'1px solid var(--glass-border)',fontSize:'13.5px',fontWeight:500,cursor:'pointer',fontFamily:'inherit',boxShadow:'var(--shadow)' }}>
              <Download size={14} strokeWidth={2}/> Export
            </motion.button>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>setShowModal(true)}
              style={{ display:'flex',alignItems:'center',gap:'7px',padding:'9px 20px',borderRadius:'50px',background:'var(--accent)',color:'#fff',border:'none',fontSize:'13.5px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px var(--accent-dim)' }}>
              <Plus size={14} strokeWidth={2.5}/> Add Expense
            </motion.button>
          </div>
        </div>

        {/* 4-column grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.45fr 1fr 1fr', gap:'16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <IncomeCard summary={summary} moneyFlow={moneyFlow} loading={loading}/>
            <StrategyCard moneyFlow={moneyFlow} loading={loading}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <OverviewCard overview={overview} summary={summary} loading={loading}/>
            <MoneyFlowCard moneyFlow={moneyFlow} loading={loading}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <FinancesCard user={user}/>
            <WealthCard wealth={wealth} loading={loading}/>
            <InsightsCard insights={insights} loading={loading} onDismiss={async (id:string)=>{ await insightsApi.dismiss(id); refetch(); }}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <AnomalyCard anomalies={anomalies} loading={loading} onResolve={async (id:string)=>{ await anomaliesApi.resolve(id); refetch(); }}/>
            <PredictionCard prediction={prediction} loading={loading}/>
          </div>
        </div>
      </div>

      {showModal && <AddExpenseModal onClose={()=>setShowModal(false)} onSuccess={refetch}/>}
    </AppShell>
  );
}
