import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, MapPin, BookOpen, X, Filter } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const REGIONS = ['Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', 'Farg\'ona', 'Qashqadaryo', 'Surxondaryo', 'Xorazm', 'Navoiy', 'Jizzax', 'Sirdaryo', 'Qoraqalpog\'iston'];
const COURSES = ['1-kurs', '2-kurs', '3-kurs', '4-kurs'];

export default function StudentsPage() {
  const { user } = useAuthStore();
  const canEdit = user?.role !== 'viewer';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [floors, setFloors] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', room_number: '', faculty: '', region: '', student_id: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get('/floors').then(r => setFloors(r.data));
    loadStudents();
  }, []);

  const loadStudents = async (params = {}) => {
    setLoading(true);
    try {
      const r = await api.get('/students', { params });
      setStudents(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const params = {};
    if (floorFilter) params.floor_id = floorFilter;
    if (search) params.search = search;
    const t = setTimeout(() => loadStudents(params), 300);
    return () => clearTimeout(t);
  }, [search, floorFilter]);

  const openAdd = () => {
    setForm({ first_name: '', last_name: '', phone: '', room_number: '', faculty: '', region: '', student_id: '' });
    setFormError('');
    setSelected(null);
    setModal('add');
  };

  const openEdit = (s) => {
    setForm({ first_name: s.first_name, last_name: s.last_name, phone: s.phone || '', room_number: s.room_number || '', faculty: s.faculty || '', region: s.region || '', student_id: s.student_id || '' });
    setFormError('');
    setSelected(s);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.room_number) {
      setFormError('Ism, familiya va xona raqami majburiy');
      return;
    }
    try {
      if (modal === 'add') {
        const r = await api.post('/students', form);
        setStudents(p => [r.data, ...p]);
        toast.success('O\'quvchi qo\'shildi');
      } else {
        const r = await api.put(`/students/${selected.id}`, form);
        setStudents(p => p.map(s => s.id === selected.id ? { ...s, ...r.data, room_number: form.room_number } : s));
        toast.success('Yangilandi');
      }
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Xato');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'quvchini o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(p => p.filter(s => s.id !== id));
      toast.success('O\'chirildi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  // Grouped by floor
  const grouped = {};
  students.forEach(s => {
    const key = s.floor_number ? `${s.floor_number}-qavat` : 'Noaniq';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title text-2xl">O'quvchilar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Jami: {students.length} nafar</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={16} />
            Qo'shish
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki familiya..." className="glass-input w-full pl-9 pr-4 py-2 text-sm" />
        </div>
        {user?.role === 'superadmin' && (
          <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)}
            className="glass-input px-3 py-2 text-sm min-w-[160px]">
            <option value="">Barcha qavatlar</option>
            {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        )}
      </div>

      {/* Table by floor groups */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([floorName, list]) => (
            <div key={floorName} className="glass-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                  {floorName.split('-')[0]}
                </div>
                <span className="font-display font-semibold text-white text-sm">{floorName}</span>
                <span className="text-xs text-slate-500">{list.length} nafar</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">O'quvchi</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Xona</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Kurs</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Viloyat</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Tel</th>
                      {canEdit && <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Amallar</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(s => (
                      <tr key={s.id} className="table-row">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-300">{s.last_name?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{s.last_name} {s.first_name}</div>
                              {s.student_id && <div className="text-xs text-slate-500 font-mono">{s.student_id}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className="font-mono text-xs px-2 py-1 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {s.room_number}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">{s.faculty || '—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-400">{s.region || '—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-400 font-mono">{s.phone || '—'}</td>
                        {canEdit && (
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center btn-ghost text-blue-400 hover:text-blue-300">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center btn-ghost text-red-400 hover:text-red-300">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>O'quvchilar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">
                {modal === 'add' ? 'Yangi o\'quvchi qo\'shish' : 'O\'quvchi tahrirlash'}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'last_name', label: 'Familiya *', placeholder: 'Familiya' },
                { key: 'first_name', label: 'Ism *', placeholder: 'Ism' },
                { key: 'phone', label: 'Telefon', placeholder: '+998901234567' },
                { key: 'room_number', label: 'Xona raqami *', placeholder: user?.role === 'sardor' ? `${user.floor_number}01` : '401' },
                
              ].map(f => (
                <div key={f.key} className={f.key === 'last_name' || f.key === 'first_name' ? '' : f.key === 'phone' ? '' : 'col-span-1'}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="glass-input w-full px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kurs</label>
                <select value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm">
                  <option value="">Tanlang</option>
                  {COURSES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Viloyat</label>
                <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm">
                  <option value="">Tanlang</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 py-2.5 text-sm">Bekor</button>
              <button onClick={handleSave} className="btn-primary flex-1 py-2.5 text-sm">
                {modal === 'add' ? 'Qo\'shish' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
