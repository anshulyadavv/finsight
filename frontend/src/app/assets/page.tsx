'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Landmark, Wallet, Shield, Edit2, Trash2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AddAssetModal from '@/components/dashboard/AddAssetModal';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const ASSET_ICONS: Record<string, any> = {
  BANK: Landmark,
  STOCK: TrendingUp,
  ETF: TrendingUp,
  GOLD: Shield,
  PROPERTY: Landmark,
  FD: Wallet,
  RSU: TrendingUp,
  INSURANCE: Shield
};

const fmt = (n: number) => '₹' + Math.abs(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { netWorthData, assets, liabilities, incomeSources, loading, fetchAll, deleteAsset, deleteLiability, deleteIncomeSource } = useAssets();
  
  // Setup modal states here ...
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'asset' | 'liability' | 'income' | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async (id: string, type: 'asset' | 'liability' | 'income') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'asset') await deleteAsset(id);
      else if (type === 'liability') await deleteLiability(id);
      else await deleteIncomeSource(id);
      fetchAll();
    } catch (e) {
      alert('Failed to delete item.');
    }
  };

  const handleEdit = (item: any, type: 'asset' | 'liability' | 'income') => {
    setEditingItem(item);
    setEditType(type);
    setShowAssetModal(true);
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (authLoading || !user) return null;

  const pieData = netWorthData?.breakdown?.assetsByType
    ? Object.entries(netWorthData.breakdown.assetsByType)
        .map(([name, value]) => ({ name, value }))
        .filter(d => (d.value as number) > 0)
    : [];

  return (
    <AppShell>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>Asset Management</h1>
            <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '3px' }}>Your net worth and portfolio</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditing(!isEditing)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '50px', background: isEditing ? 'var(--accent)' : 'var(--glass)', color: isEditing ? '#fff' : 'var(--text)', border: '1px solid var(--glass-border)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <Edit2 size={14} strokeWidth={2.5} /> {isEditing ? 'Done Editing' : 'Edit Items'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAssetModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '50px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-dim)' }}>
              <Plus size={14} strokeWidth={2.5} /> Add Asset
            </motion.button>
          </div>
        </div>

        {loading && !netWorthData ? (
          <div>Loading assets...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Flow Cards + Lists */}
            <div>
              {/* Top summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Net Worth', val: fmt(netWorthData?.netWorth), icon: Landmark, color: 'var(--accent2)' },
                  { label: 'Total Assets', val: fmt(netWorthData?.totalAssets), icon: TrendingUp, color: 'var(--accent)' },
                  { label: 'Total Liabilities', val: fmt(netWorthData?.totalLiabilities), icon: TrendingDown, color: 'var(--accent3)' },
                ].map((s, i) => (
                  <div key={i} className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <s.icon size={18} color={s.color} />
                      <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 500 }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Assets List */}
              <div className="glass" style={{ padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>Your Assets</h3>
                {assets.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No assets found. Add your first asset.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assets.map((asset) => {
                      const Icon = ASSET_ICONS[asset.type] || Wallet;
                      return (
                        <div key={asset.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '15px', alignItems: 'center', padding: '12px', background: 'var(--glass-strong)', borderRadius: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={18} color="var(--accent)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{asset.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{asset.type}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent2)' }}>
                              {fmt(asset.value)}
                            </div>
                            <AnimatePresence>
                              {isEditing && (
                                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ display: 'flex', gap: '4px', overflow: 'hidden' }}>
                                  <button onClick={() => handleEdit(asset, 'asset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: '5px' }} title="Edit">
                                    <Edit2 size={12} />
                                  </button>
                                  <button onClick={() => handleDelete(asset.id, 'asset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent3)', padding: '5px' }} title="Delete">
                                    <Trash2 size={12} />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Liabilities & Income lists would go here ... */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>Liabilities</h3>
                  {liabilities.length === 0 ? (
                    <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No liabilities.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {liabilities.map(l => (
                        <div key={l.id} style={{ padding: '10px', background: 'var(--accent3-dim)', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{l.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '13px', color: 'var(--accent3)', fontWeight: 600 }}>{fmt(l.remainingAmount)}</span>
                              <AnimatePresence>
                                {isEditing && (
                                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ display: 'flex', overflow: 'hidden' }}>
                                    <button onClick={() => handleEdit(l, 'liability')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: '2px' }} title="Edit">
                                      <Edit2 size={10} />
                                    </button>
                                    <button onClick={() => handleDelete(l.id, 'liability')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent3)', padding: '2px' }} title="Delete">
                                      <Trash2 size={10} />
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                            <div style={{ width: `${Math.min((l.remainingAmount / l.totalAmount) * 100, 100)}%`, height: '100%', background: 'var(--accent3)', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>Passive Income</h3>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent2)', marginBottom: '15px' }}>
                    {fmt(netWorthData?.passiveIncomeMonthly)} <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 500 }}>/ month</span>
                  </div>
                  {incomeSources.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '13px' }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(s.amount)} <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{s.frequency}</span></span>
                        <AnimatePresence>
                          {isEditing && (
                            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ display: 'flex', overflow: 'hidden' }}>
                              <button onClick={() => handleEdit(s, 'income')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: '2px' }} title="Edit">
                                <Edit2 size={10} />
                              </button>
                              <button onClick={() => handleDelete(s.id, 'income')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent3)', padding: '2px' }} title="Delete">
                                <Trash2 size={10} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Chart */}
            <div className="glass" style={{ padding: '24px', borderRadius: '20px', position: 'sticky', top: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Asset Breakdown</h3>
              
              {pieData.length > 0 ? (
                <div style={{ height: 280, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {pieData.map((e, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: number) => fmt(val)}
                        contentStyle={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text2)',textTransform: 'uppercase', letterSpacing: '1px' }}>Total</div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{fmt(netWorthData?.totalAssets)}</div>
                  </div>
                </div>
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '14px' }}>No data for chart</div>
              )}
              
              {/* Legend */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pieData.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                      <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(entry.value as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAssetModal && (
        <AddAssetModal 
          onClose={() => { setShowAssetModal(false); setEditingItem(null); setEditType(null); }} 
          onSuccess={fetchAll}
          initialData={editingItem}
          type={editType}
        />
      )}
    </AppShell>
  );
}
