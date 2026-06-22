import { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date: '', name: '' });

  useEffect(() => {
    api.get('/holidays').then(r => setHolidays(r.data));
  }, []);

  const handleAdd = async () => {
    if (!form.date || !form.name) { toast.error('Sana va nomni kiriting'); return; }
    try {
      const r = await api.post('/holidays', form);
      setHolidays(p => [r.data, ...p]);
      toast.success('Bayram qo\'shildi');
      setModal(false);
      setForm({ date: '', name: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/holidays/${id}`);
      setHolidays(p => p.filter(h => h.id !== id));
      toast.success('O\'chirildi');
    } catch {}
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Dam olish kunlari</h1>
          <p className="text-slate-500 text-sm mt-0.5">Bayramlar va dam olish kunlarini belgilash</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(h => (
          <div key={h.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <CalendarDays size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{h.name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {new Date(h.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(h.id)} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-red-400">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {holidays.length === 0 && (
          <div className="col-span-3 glass-card p-12 text-center text-slate-500">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>Dam olish kunlari belgilanmagan</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">Dam olish kuni qo'shish</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Sana *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nomi *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Yangi yil bayram" className="glass-input w-full px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">Bekor</button>
              <button onClick={handleAdd} className="btn-primary flex-1 py-2.5 text-sm">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
