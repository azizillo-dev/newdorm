import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Users } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [sardors, setSardors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ floor_number: '', name: '', sardor_id: '' });

  useEffect(() => {
    load();
    api.get('/users').then(r => setSardors(r.data.filter(u => u.role === 'sardor')));
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await api.get('/floors');
    setFloors(r.data);
    setLoading(false);
  };

  const openAdd = () => {
    setForm({ floor_number: '', name: '', sardor_id: '' });
    setSelected(null);
    setModal('add');
  };

  const openEdit = (f) => {
    setForm({ floor_number: f.floor_number, name: f.name, sardor_id: f.sardor_id || '' });
    setSelected(f);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.floor_number || !form.name) { toast.error('Qavat raqami va nomi majburiy'); return; }
    try {
      const payload = { ...form, sardor_id: form.sardor_id || null };
      if (modal === 'add') {
        await api.post('/floors', payload);
        toast.success('Qavat qo\'shildi. Xonalar avtomatik yaratildi.');
      } else {
        await api.put(`/floors/${selected.id}`, payload);
        toast.success('Yangilandi');
      }
      load();
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Qavatni o\'chirmoqchimisiz? Barcha o\'quvchilar ham o\'chiriladi!')) return;
    try {
      await api.delete(`/floors/${id}`);
      setFloors(p => p.filter(f => f.id !== id));
      toast.success('O\'chirildi');
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Qavatlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">{floors.length} ta qavat boshqarilmoqda</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Qavat qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {floors.map((f, i) => (
          <div key={f.id} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-blue-300"
                  style={{ background: 'linear-gradient(135deg, rgba(51,143,255,0.2), rgba(99,102,241,0.1))', border: '1px solid rgba(51,143,255,0.2)' }}>
                  {f.floor_number}
                </div>
                <div>
                  <div className="font-display font-semibold text-white">{f.name}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Users size={11} />
                    {f.student_count} o'quvchi
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(f)} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center text-blue-400">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(f.id)} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Sardor</span>
                {f.sardor_name ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">{f.sardor_name?.charAt(0)}</span>
                    </div>
                    <span className="text-xs text-slate-300">{f.sardor_name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 italic">Tayinlanmagan</span>
                )}
              </div>

              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #338fff40, #338fff)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">
                {modal === 'add' ? 'Yangi qavat qo\'shish' : 'Qavatni tahrirlash'}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Qavat raqami *</label>
                <input type="number" value={form.floor_number} onChange={e => setForm({ ...form, floor_number: e.target.value, name: `${e.target.value}-Qavat` })}
                  placeholder="1-9" min="1" max="20" className="glass-input w-full px-3 py-2 text-sm" disabled={modal === 'edit'} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nomi *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="5-Qavat" className="glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Sardor</label>
                <select value={form.sardor_id} onChange={e => setForm({ ...form, sardor_id: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm">
                  <option value="">Tayinlanmagan</option>
                  {sardors.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              {modal === 'add' && (
                <div className="p-3 rounded-xl text-xs text-blue-300" style={{ background: 'rgba(51,143,255,0.1)', border: '1px solid rgba(51,143,255,0.2)' }}>
                  ℹ️ Qavat qo'shilganda xonalar avtomatik yaratiladi (01-12)
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 py-2.5 text-sm">Bekor</button>
              <button onClick={handleSave} className="btn-primary flex-1 py-2.5 text-sm">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
