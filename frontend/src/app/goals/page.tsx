'use client';
import { useEffect, useState } from 'react';
import { Plus, Target, Users, Calendar, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Link from 'next/link';
import AddGoalModal from '@/components/dashboard/AddGoalModal';

const fmt = (n: number) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const { goals, loading, fetchGoals } = useGoals();
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleDelete = async (e: any, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete('/goals/' + id);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const handleEdit = (e: any, goal: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(goal);
    setShowGoalModal(true);
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (authLoading || !user) return null;

  return (
    <AppShell>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>Savings Goals</h1>
            <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '3px' }}>Collaborate and reach your targets faster</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditing(!isEditing)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '50px', background: isEditing ? 'var(--accent)' : 'var(--glass)', color: isEditing ? '#fff' : 'var(--text)', border: '1px solid var(--glass-border)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <Edit2 size={14} strokeWidth={2.5} /> {isEditing ? 'Done Editing' : 'Edit Items'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowGoalModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '50px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-dim)' }}>
              <Plus size={14} strokeWidth={2.5} /> Create Goal
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div>Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="glass" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px' }}>
            <Target size={40} style={{ margin: '0 auto 15px', color: 'var(--accent)', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '5px' }}>No Goals Set Yet</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '20px' }}>Start tracking what you are saving for.</p>
            <button onClick={() => setShowGoalModal(true)} style={{ padding: '10px 24px', borderRadius: '50px', background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', color: 'var(--text)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Create your first goal
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {goals.map((goal) => {
              // Basic logic to determine progress roughly on index, but the real progress comes from the progress endpoint
              // Typically list endpoint should include basic progress. We assume totalSaved is not attached unless requested, 
              // We'll show basic info on index.
              
              const isShared = goal.members?.length > 1;
              const date = new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

              return (
                <Link href={`/goals/${goal.id}`} key={goal.id} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ y: -4 }} className="glass hover:bg-glass-hover" style={{ padding: '24px', borderRadius: '20px', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={20} color="var(--accent)" />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                      {isShared && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--glass-strong)', padding: '5px 10px', borderRadius: '20px' }}>
                          <Users size={12} color="var(--text2)" />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)' }}>Shared</span>
                        </div>
                      )}
                      
                        <AnimatePresence>
                          {isEditing && (
                            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ display: 'flex', overflow: 'hidden' }}>
                              <button onClick={(e) => handleEdit(e, goal)} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)', marginRight: 4 }} title="Edit">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={(e) => handleDelete(e, goal.id)} style={{ background: 'var(--accent3-dim)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent3)' }} title="Delete">
                                <Trash2 size={12} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 5px 0', color: 'var(--text)' }}>{goal.title}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text3)', fontSize: '13px', marginBottom: '20px' }}>
                      <Calendar size={14} /> <span>Target: {date}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '2px' }}>Target Amount</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent2)' }}>{fmt(goal.targetAmount)}</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showGoalModal && <AddGoalModal onClose={() => { setShowGoalModal(false); setEditingItem(null); }} onSuccess={fetchGoals} editData={editingItem} />}
    </AppShell>
  );
}
