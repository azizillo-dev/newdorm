import { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, Filter, TrendingUp, Users } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('monthly');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [floors, setFloors] = useState([]);
  const [floorFilter, setFloorFilter] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin') api.get('/floors').then(r => setFloors(r.data));
  }, []);

  useEffect(() => { loadReport(); }, [tab, month, year, date, floorFilter]);

  const loadReport = async () => {
    setLoading(true);
    try {
      let r;
      if (tab === 'monthly') {
        r = await api.get('/reports/monthly', { params: { month, year, ...(floorFilter && { floor_number: floorFilter }) } });
        setData(r.data.data);
      } else {
        r = await api.get('/reports/daily', { params: { date, ...(floorFilter && { floor_number: floorFilter }) } });
        setData(r.data.data);
      }
    } catch {}
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { type: tab };
      if (tab === 'monthly') { params.month = month; params.year = year; }
      else { params.date = date; }
      if (floorFilter) params.floor_number = floorFilter;

      const r = await api.get('/reports/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `davomat-${tab}-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel fayl yuklandi');
    } catch { toast.error('Export xatosi'); }
    setExporting(false);
  };

  // Chart data
  const chartData = data.slice(0, 20).map(d => ({
    name: `${d.last_name?.substring(0, 8)}`,
    bor: parseInt(d.present_days || (d.status === 'bor' ? 1 : 0)),
    percent: parseFloat(d.attendance_percent) || 0
  }));

  const avgPercent = data.length > 0
    ? Math.round(data.reduce((s, d) => s + (parseFloat(d.attendance_percent) || 0), 0) / data.length)
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title text-2xl">Hisobotlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Davomat statistikasi va eksport</p>
        </div>
        <button onClick={handleExport} disabled={exporting || loading}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          {exporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
          Excel yuklab olish
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 flex gap-1 w-fit">
        {[['monthly', 'Oylik'], ['daily', 'Kunlik']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === key ? 'btn-primary' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        {tab === 'monthly' ? (
          <>
            <select value={month} onChange={e => setMonth(e.target.value)} className="glass-input px-3 py-2 text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('uz-UZ', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} className="glass-input px-3 py-2 text-sm">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        ) : (
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')} className="glass-input px-3 py-2 text-sm" />
        )}
        {user?.role === 'superadmin' && (
          <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="glass-input px-3 py-2 text-sm min-w-[160px]">
            <option value="">Barcha qavatlar</option>
            {floors.map(f => <option key={f.id} value={f.floor_number}>{f.name}</option>)}
          </select>
        )}

        {tab === 'monthly' && data.length > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            style={{ background: 'rgba(51,143,255,0.1)', border: '1px solid rgba(51,143,255,0.2)' }}>
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-blue-300 font-semibold">{avgPercent}%</span>
            <span className="text-blue-400/70 text-xs">o'rtacha davomat</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {tab === 'monthly' && data.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Davomat foizi (top 20)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Davomat']} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.percent >= 90 ? '#22c55e' : d.percent >= 70 ? '#f59e0b' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">#</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">O'quvchi</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Xona</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Fakultet</th>
                  {tab === 'monthly' ? (
                    <>
                      <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Bor</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Yo'q</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Sababli</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Foiz</th>
                    </>
                  ) : (
                    <th className="text-center px-5 py-3 text-xs font-medium text-slate-500">Holat</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="px-5 py-3 text-xs text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-white text-sm">{row.last_name} {row.first_name}</div>
                      <div className="text-xs text-slate-500">{row.region}</div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {row.room_number}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{row.faculty || '—'}</td>
                    {tab === 'monthly' ? (
                      <>
                        <td className="text-center px-3 py-3"><span className="status-bor px-2 py-0.5 text-xs">{row.present_days || 0}</span></td>
                        <td className="text-center px-3 py-3"><span className="status-yoq px-2 py-0.5 text-xs">{row.absent_days || 0}</span></td>
                        <td className="text-center px-3 py-3"><span className="status-sababli px-2 py-0.5 text-xs">{row.excused_days || 0}</span></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${row.attendance_percent || 0}%`,
                                background: (row.attendance_percent || 0) >= 90 ? '#22c55e' : (row.attendance_percent || 0) >= 70 ? '#f59e0b' : '#ef4444'
                              }} />
                            </div>
                            <span className="text-xs font-mono text-slate-300 w-12 text-right">{row.attendance_percent || 0}%</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="text-center px-5 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="text-center p-12 text-slate-500">
                <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                <p>Ma'lumot topilmadi</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    bor: 'status-bor',
    yoq: 'status-yoq',
    sababli: 'status-sababli',
    sababsiz: 'status-sababsiz',
    belgilanmagan: ''
  };
  const labels = { bor: 'Bor', yoq: 'Yo\'q', sababli: 'Sababli', sababsiz: 'Sababsiz', belgilanmagan: 'Belgilanmagan' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${map[status] || 'text-slate-500'}`}>
      {labels[status] || status}
    </span>
  );
}
