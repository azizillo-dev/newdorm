import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Building2, Calendar, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';
import useThemeStore from "../store/themeStore";
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { dashboardPrefs } = useThemeStore();
  const prefs = dashboardPrefs || { showStats: true, showTrend: true, showFloors: true, showTable: true };
  const today = format(new Date(), 'dd MMMM yyyy', { locale: uz });

  useEffect(() => {
    api.get('/reports/stats').then(r => {
      setStats(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  const t = stats?.today || {};
  const total = parseInt(t.total) || 0;
  const present = parseInt(t.present) || 0;
  const absent = parseInt(t.absent) || 0;
  const excused = parseInt(t.excused) || 0;
  const notMarked = parseInt(t.not_marked) || 0;
  const attendanceRate = total > 0 ? Math.round((present / (total - notMarked || 1)) * 100) : 0;

  const statCards = [
    {
      label: 'Jami o\'quvchilar',
      value: total,
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      glow: 'rgba(59,130,246,0.15)'
    },
    {
      label: 'Bugun bor',
      value: present,
      icon: CheckCircle,
      color: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-400',
      glow: 'rgba(34,197,94,0.15)'
    },
    {
      label: 'Yo\'q',
      value: absent,
      icon: XCircle,
      color: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/20',
      iconColor: 'text-red-400',
      glow: 'rgba(239,68,68,0.15)'
    },
    {
      label: 'Sababli',
      value: excused,
      icon: AlertCircle,
      color: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      glow: 'rgba(245,158,11,0.15)'
    },
  ];

  const weekData = (stats?.week_trend || []).map(d => ({
    date: format(new Date(d.date), 'dd/MM'),
    'Bor': parseInt(d.present),
    'Yo\'q': parseInt(d.absent),
  }));

  const floorData = (stats?.floors || []).map(f => ({
    name: `${f.floor_number}-qavat`,
    total: parseInt(f.total) || 0,
    present: parseInt(f.present) || 0,
    absent: parseInt(f.absent) || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title text-2xl lg:text-3xl">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
            <Calendar size={13} />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <TrendingUp size={16} className="text-green-400" />
          <span className="text-green-400 font-semibold text-sm">{attendanceRate}%</span>
          <span className="text-green-400/70 text-xs">davomat</span>
        </div>
      </div>

      {prefs.showStats && (<>/* Stat cards */</>)}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label}
            className={`stat-card bg-gradient-to-br ${card.color} border ${card.borderColor} animate-slide-up`}
            style={{ animationDelay: `${i * 0.08}s`, boxShadow: `0 8px 32px ${card.glow}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color} border ${card.borderColor}`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white mb-1">{card.value}</div>
            <div className="text-xs text-slate-400">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Week trend */}
        <div className="glass-card p-5 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white">7 Kunlik Trend</h3>
            <span className="text-xs text-slate-500">So'nggi 7 kun</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Bor" stroke="#22c55e" fill="url(#colorPresent)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
              <Area type="monotone" dataKey="Yo'q" stroke="#ef4444" fill="url(#colorAbsent)" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Floor stats */}
        <div className="glass-card p-5 animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white">Qavatlar bo'yicha</h3>
            <span className="text-xs text-slate-500">Bugungi davomat</span>
          </div>
          {user?.role === 'sardor' ? (
            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
              {floorData.map(f => (
                <FloorBar key={f.name} floor={f} />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={floorData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="present" name="Bor" fill="#338fff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Yo'q" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Floor table (superadmin only) */}
      {user?.role === 'superadmin' && stats?.floors && (
        <div className="glass-card overflow-hidden animate-slide-up delay-400">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-display font-semibold text-white">Qavatlar statistikasi</h3>
            <Building2 size={16} className="text-slate-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Qavat</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Jami</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Bor</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Yo'q</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Davomat %</th>
                </tr>
              </thead>
              <tbody>
                {stats.floors.map(f => {
                  const tot = parseInt(f.total) || 0;
                  const prs = parseInt(f.present) || 0;
                  const abs = parseInt(f.absent) || 0;
                  const pct = tot > 0 ? Math.round((prs / tot) * 100) : 0;
                  return (
                    <tr key={f.floor_number} className="table-row">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                            {f.floor_number}
                          </div>
                          <span className="font-medium text-white">{f.name}</span>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3 text-slate-300">{tot}</td>
                      <td className="text-center px-4 py-3">
                        <span className="status-bor px-2 py-0.5 text-xs font-medium">{prs}</span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="status-yoq px-2 py-0.5 text-xs font-medium">{abs}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-mono text-slate-400 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FloorBar({ floor }) {
  const pct = floor.total > 0 ? Math.round((floor.present / floor.total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-16 flex-shrink-0">{floor.name}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #338fff, #22c55e)' }} />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">{pct}%</span>
    </div>
  );
}
