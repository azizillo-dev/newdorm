import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react';
import api from '../utils/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/attendance/alerts');
      setAlerts(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Ogohlantirishlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">3+ kun ketma-ket yo'q bo'lgan o'quvchilar</p>
        </div>
        <button onClick={load} className="btn-ghost px-4 py-2 text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <AlertTriangle size={28} className="text-green-400" />
          </div>
          <h3 className="font-display font-semibold text-white text-lg mb-2">Hammasi yaxshi!</h3>
          <p className="text-slate-500 text-sm">So'nggi 7 kunda 3+ kun yo'q bo'lgan o'quvchi yo'q</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-white/5"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <AlertTriangle size={18} className="text-red-400" />
            <span className="font-semibold text-red-300">{alerts.length} ta o'quvchi ogohlantirishda</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">O'quvchi</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Xona</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Qavat</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Yo'q kunlar</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500">So'nggi yo'q sana</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={a.id} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <span className="text-xs font-bold text-red-300">{a.last_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{a.last_name} {a.first_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg text-slate-300"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {a.room_number}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 text-slate-400 text-xs">{a.floor_number}-qavat</td>
                    <td className="text-center px-3 py-3">
                      <span className="status-yoq px-3 py-1 text-sm font-bold">{a.absent_days}</span>
                    </td>
                    <td className="text-center px-5 py-3 text-xs text-slate-400 font-mono">
                      {new Date(a.last_absent_date).toLocaleDateString('uz-UZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
