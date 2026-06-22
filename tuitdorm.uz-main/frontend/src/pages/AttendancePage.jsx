import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Search, CheckCheck, ChevronDown, RotateCcw, Loader } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  bor: { label: 'Bor', icon: CheckCircle, className: 'status-bor', bg: 'bg-green-500/20 border-green-500/30', color: '#22c55e' },
  yoq: { label: "Yo'q", icon: XCircle, className: 'status-yoq', bg: 'bg-red-500/20 border-red-500/30', color: '#ef4444' },
  sababli: { label: 'Sababli', icon: AlertCircle, className: 'status-sababli', bg: 'bg-amber-500/20 border-amber-500/30', color: '#f59e0b' },
  sababsiz: { label: 'Sababsiz', icon: Clock, className: 'status-sababsiz', bg: 'bg-orange-500/20 border-orange-500/30', color: '#f97316' },
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const canMark = user?.role !== 'viewer';
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [floors, setFloors] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(null);
  const [reason, setReason] = useState('');
  const isToday = date === today;

  useEffect(() => {
    if (user?.role === 'superadmin') {
      api.get('/floors').then(r => setFloors(r.data));
    }
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date };
      if (floorFilter) params.floor_number = floorFilter;
      const r = await api.get('/attendance', { params });
      setData(r.data);
    } catch {}
    setLoading(false);
  }, [date, floorFilter]);

  useEffect(() => { load(); }, [load]);

  const mark = async (studentId, status, reasonText = '') => {
    if (!canMark || !isToday) return;
    setSaving(s => ({ ...s, [studentId]: true }));
    try {
      await api.post('/attendance', { student_id: studentId, date, status, reason: reasonText });
      setData(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s.id === studentId ? { ...s, status, reason: reasonText } : s
        )
      }));
      toast.success('Saqlandi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
    setSaving(s => ({ ...s, [studentId]: false }));
  };

  const markAllPresent = async () => {
    if (!isToday) { toast.error("Faqat bugungi davomatni belgilash mumkin"); return; }
    const targetFloor = user?.role === 'sardor' ? user.floor_number : floorFilter;
    if (!targetFloor) { toast.error('Avval qavatni tanlang'); return; }
    try {
      const r = await api.post('/attendance/mark-all-present', { date, floor_number: targetFloor });
      toast.success(r.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const filtered = (data?.students || []).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.first_name?.toLowerCase().includes(q) || s.last_name?.toLowerCase().includes(q) || s.room_number?.includes(q);
  });

  const grouped = {};
  filtered.forEach(s => {
    const key = `${s.floor_number}-qavat`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const stats = {
    total: filtered.length,
    bor: filtered.filter(s => s.status === 'bor').length,
    yoq: filtered.filter(s => ['yoq','sababli','sababsiz'].includes(s.status)).length,
    sababli: filtered.filter(s => s.status === 'sababli').length,
    belgilanmagan: filtered.filter(s => !s.status).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title text-2xl">Davomat</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {!isToday && <span className="text-amber-400">⚠️ O'tgan kun — faqat ko'rish mumkin</span>}
            {isToday && (data?.is_holiday ? <span className="text-amber-400">🎉 Dam olish kuni: {data.holiday_name}</span> : 'Kunlik davomat belgilash')}
          </p>
        </div>
        {canMark && isToday && (
          <button onClick={markAllPresent} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <CheckCheck size={16} /> Hammasi bor
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jami', val: stats.total, color: '#338fff' },
          { label: 'Bor', val: stats.bor, color: '#22c55e' },
          { label: "Yo'q", val: stats.yoq, color: '#ef4444' },
          { label: 'Belgilanmagan', val: stats.belgilanmagan, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ background: s.color, opacity: 0.7 }} />
            <div>
              <div className="text-xl font-display font-bold text-white">{s.val}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="glass-input px-3 py-2 text-sm" max={today} />
        {user?.role === 'superadmin' && (
          <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)}
            className="glass-input px-3 py-2 text-sm min-w-[160px]">
            <option value="">Barcha qavatlar</option>
            {floors.map(f => <option key={f.id} value={f.floor_number}>{f.name}</option>)}
          </select>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki xona raqami..." className="glass-input w-full pl-9 pr-4 py-2 text-sm" />
        </div>
        <button onClick={load} className="btn-ghost px-3 py-2 flex items-center gap-2 text-sm">
          <RotateCcw size={14} /> Yangilash
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([floorName, students]) => (
            <FloorGroup key={floorName} floorName={floorName} students={students}
              canMark={canMark} saving={saving} onMark={mark} isToday={isToday}
              onMarkWithReason={(student) => { setShowReasonModal(student); setReason(''); }} />
          ))}
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500">
              <p>O'quvchilar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {showReasonModal && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-white text-lg mb-4">Sabab kiriting</h3>
            <p className="text-sm text-slate-400 mb-4">
              {showReasonModal.last_name} {showReasonModal.first_name} — xona {showReasonModal.room_number}
            </p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Sababni kiriting..." className="glass-input w-full px-4 py-3 text-sm h-24 resize-none mb-4" />
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setShowReasonModal(null)}>Bekor</button>
              <button className="btn-primary flex-1 py-2.5 text-sm"
                onClick={async () => { await mark(showReasonModal.id, 'sababli', reason); setShowReasonModal(null); }}>
                Sababli deb belgilash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FloorGroup({ floorName, students, canMark, saving, onMark, onMarkWithReason, isToday }) {
  const [open, setOpen] = useState(true);
  const bor = students.filter(s => s.status === 'bor').length;
  const yoq = students.filter(s => s.status === 'yoq').length;

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 font-mono">
            {floorName.split('-')[0]}
          </div>
          <span className="font-display font-semibold text-white">{floorName}</span>
          <span className="text-xs text-slate-500 font-body">{students.length} o'quvchi</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="status-bor px-2 py-0.5 text-xs">{bor} bor</span>
          <span className="status-yoq px-2 py-0.5 text-xs">{yoq} yo'q</span>
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">O'quvchi</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Xona</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Kurs</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Holat</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <StudentRow key={student.id} student={student} canMark={canMark}
                    saving={saving[student.id]} onMark={onMark} isToday={isToday}
                    onMarkWithReason={onMarkWithReason} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentRow({ student, canMark, saving, onMark, onMarkWithReason, isToday }) {
  const statusCfg = student.status ? STATUS_CONFIG[student.status] : null;
  const canEdit = canMark && isToday && !student.status;
  const isYoq = student.status === 'yoq';
  const alreadyMarked = !!student.status;

  return (
    <tr className="table-row">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-300">{student.last_name?.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium text-white text-sm">{student.last_name} {student.first_name}</div>
            <div className="text-xs text-slate-500">{student.region}</div>
            {student.reason && <div className="text-xs text-amber-400 mt-0.5">📝 {student.reason}</div>}
          </div>
        </div>
      </td>
      <td className="text-center px-3 py-3">
        <span className="font-mono text-xs px-2 py-1 rounded-lg text-slate-300"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {student.room_number}
        </span>
      </td>
      <td className="px-3 py-3 text-xs text-slate-400">{student.faculty}</td>
      <td className="px-5 py-3">
        {saving ? (
          <div className="flex justify-end"><Loader size={16} className="animate-spin text-blue-400" /></div>
        ) : canEdit ? (
          // Bugun, belgilanmagan — faqat Bor / Yo'q
          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => onMark(student.id, 'bor')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-white/3 border-white/8 text-slate-400 hover:bg-green-500/15 hover:text-green-300 hover:border-green-500/30 transition-all">
              Bor
            </button>
            <button onClick={() => onMark(student.id, 'yoq')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-white/3 border-white/8 text-slate-400 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30 transition-all">
              Yo'q
            </button>
          </div>
        ) : alreadyMarked && isToday && isYoq ? (
          // Bugun yo'q belgilangan — sababli/sababsiz o'zgartirish mumkin
          <div className="flex items-center justify-end gap-1.5">
            <span className="status-yoq px-2 py-0.5 text-xs">Yo'q</span>
            <button onClick={() => onMarkWithReason(student)}
              className="px-2 py-1 rounded-lg text-xs border bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
              Sababli
            </button>
            <button onClick={() => onMark(student.id, 'sababsiz')}
              className="px-2 py-1 rounded-lg text-xs border bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all">
              Sababsiz
            </button>
          </div>
        ) : (
          // O'tgan kun yoki bor belgilangan — faqat ko'rish
          <div className="flex justify-end">
            {statusCfg ? (
              <span className={`${statusCfg.className} px-2.5 py-1 text-xs font-medium`}>{statusCfg.label}</span>
            ) : (
              <span className="text-xs text-slate-600">—</span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
