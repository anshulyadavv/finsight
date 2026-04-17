'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import AppShell from '@/components/layout/AppShell';
import {
  TotalBalanceCard, IncomeExpenseCard, RevenueFlowCard, ExpenseSplitCard,
  MyCardsList, SubscriptionsList
} from '@/components/dashboard/EtherealCards';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { summary, overview, moneyFlow, wealth, loading, refetch } = useDashboard();

  return (
    <AppShell>
      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col xl:flex-row items-start gap-6 text-gray-900 dark:text-ethereal-text">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">My Dashboard</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowModal(true)}
                className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm dark:shadow-none"
              >
                <Plus size={16} /> Record Transaction
              </button>
            </div>
          </div>

          {/* Top Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <TotalBalanceCard summary={summary} loading={loading} />
            </div>
            <div className="flex flex-col gap-6">
              <IncomeExpenseCard type="income" summary={summary} loading={loading} />
              <IncomeExpenseCard type="expense" summary={summary} loading={loading} />
            </div>
          </div>

          {/* Bottom Row Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[320px]">
            <RevenueFlowCard moneyFlow={moneyFlow} loading={loading} />
            <ExpenseSplitCard overview={overview} summary={summary} loading={loading} />
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full xl:w-[340px] bg-white dark:bg-ethereal-card border border-black/5 dark:border-white/5 rounded-[32px] p-6 shadow-2xl flex flex-col gap-8 min-h-0 transition-colors duration-300">
          <MyCardsList />
          <SubscriptionsList />
        </div>

      </div>

      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} onSuccess={refetch} />}
    </AppShell>
  );
}
