import { useState, useEffect } from 'react';
import { Trash2, CheckCircle, XCircle, Settings, Clock, ChevronDown, History } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TrashPage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupModal, setSetupModal] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [setupForm, setSetupForm] = useState({ start_room_id: '', start_date: format(new Date(), 'yyyy-MM-dd') });
  const [showHistory, setShowHistory] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/trash');
      setSchedule(r.data);
    } catch {}
    setLoading(false);
  };

  const loadHistory = async (floor_id) => {
    try {
      const r = await api.get('/trash/history', { params: floor_id ? { floor_id } : {} });
      setHistory(r.data);
      setShowHistory(true);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const openSetup = async (floor) => {
    setSetupModal(floor);
    setSetupForm({ start_room_id: floor.start_room_id || '', start_date: format(new Date(), 'yyyy-MM-dd') });
    const r = await api.get(`/floors/${floor.floor_number}/rooms`);
    setRooms(r.data);
  };

  const handleSetup = async () => {
    if (!setupForm.start_room_id) { toast.error('Xona tanlang'); return; }
    try {
      await api.post('/trash/start', { floor_id: setupModal.floor_id, start_room_id: setupForm.start_room_id, start_date: setupForm.start_date });
      toast.success('Navbat belgilandi');
      setSetupModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const handleMark = async (floor_id, status) => {
    try {
      await api.post('/trash/mark', { floor_id, status });
      toast.success(status === 'done' ? '✅ To\'kdi deb belgilandi' : '❌ To\'kmadi deb belgilandi');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const statusConfig = {
    done: { label: 'To\'kdi', className: 'status-bor', icon: CheckCircle },
    not_done: { label: 'To\'kmadi', className: 'status-yoq', icon: XCircle },
    pending: { label: 'Belgilanmagan', className: 'status-sababli', icon: Clock },
  };

  const today = format(new Date(), 'dd.MM.yyyy');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title text-2xl flex items-center gap-2">
            <Trash2 size={24} className="text-green-400" />
            Axlat Navbati
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Bugun: {today}</p>
        </div>
        <button onClick={() => loadHistory(user.role === 'sardor' ? schedule[0]?.floor_id : null)}
          className="btn-ghost px-4 py-2 text-sm flex items-center gap-2">
          <History size={14} /> Tarix
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedule.map((floor, i) => {
            const log = floor.log;
            const status = log?.status || 'pending';
            const cfg = statusConfig[status];
            const canMark = user.role === 'superadmin' || (user.role === 'sardor' && user.floor_number === floor.floor_number);

            return (
              <div key={floor.floor_id} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Floor header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-display font-bold text-green-300"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      {floor.floor_number}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-white">{floor.floor_name}</div>
                      <div className="text-xs text-slate-500">Axlat navbati</div>
                    </div>
                  </div>
                  {(user.role === 'superadmin' || canMark) && (
                    <button onClick={() => openSetup(floor)} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center text-slate-400">
                      <Settings size={14} />
                    </button>
                  )}
                </div>

                {/* Today's room */}
                {floor.today_room_number ? (
                  <>
                    <div className="mb-4 p-3 rounded-xl text-center"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <div className="text-xs text-slate-500 mb-1">Bugungi navbat</div>
                      <div className="text-3xl font-display font-bold text-green-300">{floor.today_room_number}</div>
                      <div className="text-xs text-slate-500 mt-1">-xona</div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slateaydi-500">Holat:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${cfg.className}`}>
                        <cfg.icon size={12} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Mark buttons */}
                    {canMark && (
                      <div className="flex gap-2">
                        <button onClick={() => handleMark(floor.floor_id, 'done')}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${status === 'done' ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-green-500/10 hover:text-green-300'}`}>
                          <CheckCircle size={13} /> To'kdi
                        </button>
                        <button onClick={() => handleMark(floor.floor_id, 'not_done')}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${status === 'not_done' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-300'}`}>
                          <XCircle size={13} /> To'kmadi
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-slate-500 text-sm mb-3">Navbat belgilanmagan</div>
                    {canMark && (
                      <button onClick={() => openSetup(floor)} className="btn-primary px-4 py-2 text-xs">
                        Navbatni boshlash
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content p-6 max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">Axlat tarixi</h3>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="overflow-auto max-h-96 scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Sana</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Qavat</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Xona</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Holat</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Belgilagan</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const cfg = statusConfig[h.status] || statusConfig.pending;
                    return (
                      <tr key={h.id} className="table-row">
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{new Date(h.date).toLocaleDateString('uz-UZ')}</td>
                        <td className="text-center px-3 py-3 text-xs text-slate-300">{h.floor_number}-qavat</td>
                        <td className="text-center px-3 py-3">
                          <span className="font-mono text-xs px-2 py-1 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {h.room_number}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs ${cfg.className}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{h.marked_by_name || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {history.length === 0 && <div className="text-center py-8 text-slate-500">Tarix yo'q</div>}
            </div>
          </div>
        </div>
      )}

      {/* Setup modal */}
      {setupModal && (
        <div className="modal-overlay" onClick={() => setSetupModal(null)}>
          <div className="modal-content p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">
                {setupModal.floor_name} — navbatni sozlash
              </h3>
              <button onClick={() => setSetupModal(null)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Boshlash sanasi</label>
                <input type="date" value={setupForm.start_date}
                  onChange={e => setSetupForm({ ...setupForm, start_date: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Shu sanada navbat qaysi xonada edi?</label>
                <select value={setupForm.start_room_id}
                  onChange={e => setSetupForm({ ...setupForm, start_room_id: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm">
                  <option value="">Xona tanlang</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}-xona</option>)}
                </select>
              </div>
              <div className="p-3 rounded-xl text-xs text-blue-300" style={{ background: 'rgba(51,143,255,0.1)', border: '1px solid rgba(51,143,255,0.2)' }}>
                ℹ️ Shu sanadan boshlab har kuni avtomatik keyingi xonaga o'tadi
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setSetupModal(null)} className="btn-ghost flex-1 py-2.5 text-sm">Bekor</button>
              <button onClick={handleSetup} className="btn-primary flex-1 py-2.5 text-sm">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
