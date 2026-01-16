import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from './ui';
import { RefreshCw, Database, Brain, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from './Toast';

/**
 * AdminDashboard Component
 * Internal monitoring dashboard for system health and statistics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const fetchStats = async (showToast = false) => {
    try {
      setRefreshing(true);

      // Fetch general stats and AI stats in parallel
      const [statsRes, aiStatsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`).catch(() => null),
        fetch(`${API_URL}/admin/ai-stats`).catch(() => null),
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        if (data.success) setStats(data.stats);
      }

      if (aiStatsRes?.ok) {
        const data = await aiStatsRes.json();
        if (data.success) setAiStats(data.stats);
      }

      if (showToast) {
        toast.success('נתונים רועננו! 🔄');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (showToast) {
        toast.error('שגיאה בטעינת נתונים');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleClearDossiers = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את כל התיקים? פעולה זו בלתי הפיכה!')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/clear-dossiers`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`נמחקו ${data.deleted} תיקים! ✅`);
        fetchStats(false);
      } else {
        toast.error(data.error || 'שגיאה במחיקה');
      }
    } catch (error) {
      toast.error('שגיאה במחיקת תיקים');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats && !aiStats) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-mint-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-mint-600 animate-spin"></div>
          </div>
          <p className="text-slate-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-ink">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">System monitoring & statistics</p>
          </div>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => fetchStats(true)}
            disabled={refreshing}
          >
            רענן
          </Button>
        </div>

        {/* AI Stats */}
        {aiStats && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-mint-600" />
              AI Usage Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="text-sm text-slate-500">Total AI Calls</div>
                <div className="text-3xl font-black text-ink mt-1">
                  {aiStats.overview?.total_calls || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-500">Gemini (Free)</div>
                <div className="text-3xl font-black text-green-600 mt-1">
                  {aiStats.overview?.gemini_calls || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {aiStats.overview?.gemini_percentage || 0}% of total
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-500">Claude (Paid)</div>
                <div className="text-3xl font-black text-blue-600 mt-1">
                  {aiStats.overview?.claude_calls || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-500">Total Cost</div>
                <div className="text-3xl font-black text-ink mt-1">
                  {aiStats.costs?.total_cost || '$0.00'}
                </div>
                <div className="text-xs text-green-600 font-semibold mt-1">
                  Saved: {aiStats.costs?.savings?.usd || '$0'}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Database Stats (if available) */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-600" />
              Database Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="text-sm text-slate-500">Total Products</div>
                <div className="text-3xl font-black text-ink mt-1">
                  {stats.general?.total_products || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-500">Total Dossiers</div>
                <div className="text-3xl font-black text-ink mt-1">
                  {stats.general?.total_dossiers || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-500">Avg Confidence</div>
                <div className="text-3xl font-black text-mint-600 mt-1">
                  {stats.general?.avg_confidence ? `${Math.round(stats.general.avg_confidence)}%` : '—'}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* System Health */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            System Health
          </h2>
          <Card className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-slate-500 mb-2">Backend Status</div>
                <Badge variant="success">Running</Badge>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-2">Database</div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-2">Redis Cache</div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Low Confidence Dossiers */}
        {stats?.lowConfidence?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Confidence Dossiers
            </h2>
            <Card className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-border">
                    <tr>
                      <th className="pb-3 font-semibold text-ink">Product</th>
                      <th className="pb-3 font-semibold text-ink">Confidence</th>
                      <th className="pb-3 font-semibold text-ink">Last Updated</th>
                      <th className="pb-3 font-semibold text-ink">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowConfidence.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50 last:border-0">
                        <td className="py-3 text-ink font-medium">{item.name}</td>
                        <td className="py-3">
                          <Badge variant="warning">{item.confidence_score}%</Badge>
                        </td>
                        <td className="py-3 text-slate-600">
                          {new Date(item.last_updated).toLocaleDateString('he-IL')}
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="secondary">
                            Rebuild
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Actions</h2>
          <Card className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink">Clear All Dossiers</div>
                  <div className="text-sm text-slate-600">
                    Delete all dossiers from database (products will remain)
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={handleClearDossiers}
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
