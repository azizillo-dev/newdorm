import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Shield, UserCog, Eye, Key } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLES = { superadmin: 'Blok Hokimi', sardor: 'Qavat Sardori', viewer: 'Kuzatuvchi' };
const roleBadge = { superadmin: 'bg-amber-500/20 text-amber-300 border-amber-500/30', sardor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', viewer: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'sardor', floor_number: '', phone: '' });
  const [passModal, setPassModal] = useState(null);
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/floors')]).then(([u, f]) => {
      setUsers(u.data);
      setFloors(f.data);
      setLoading(false);
    });
  }, []);

  const openAdd = () => {
    setForm({ username: '', password: '', full_name: '', role: 'sardor', floor_number: '', phone: '' });
    setSelected(null);
    setModal('add');
  };

  const openEdit = (u) => {
    setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role, floor_number: u.floor_number || '', phone: u.phone || '' });
    setSelected(u);
    setModal('edit');
  };

  const handleSave = async () => {
    try {
      if (modal === 'add') {
        if (!form.username || !form.password || !form.full_name) { toast.error('Barcha majburiy maydonlarni to\'ldiring'); return; }
        const r = await api.post('/users', form);
        setUsers(p => [r.data, ...p]);
        toast.success('Foydalanuvchi qo\'shildi');
      } else {
        const r = await api.put(`/users/${selected.id}`, form);
        setUsers(p => p.map(u => u.id === selected.id ? { ...u, ...r.data } : u));
        toast.success('Yangilandi');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlang')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(p => p.filter(u => u.id !== id));
      toast.success('O\'chirildi');
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  const handlePassChange = async () => {
    if (!newPass || newPass.length < 4) { toast.error('Parol kamida 4 ta belgi'); return; }
    try {
      await api.put('/auth/admin-password', { user_id: passModal.id, new_password: newPass });
      toast.success('Parol yangilandi');
      setPassModal(null);
      setNewPass('');
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Foydalanuvchilar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Foydalanuvchi</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Rol</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-slate-500">Qavat</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">Telefon</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500">So'nggi kirish</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-300">{u.full_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.full_name}</div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs text-slate-500 font-mono">@{u.username}</div>
                          {onlineUsers.includes(u.id) && <span className="flex items-center gap-1 text-xs text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>Online</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border ${roleBadge[u.role]}`}>
                      {ROLES[u.role]}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3 text-slate-400 text-xs">
                    {u.floor_number ? `${u.floor_number}-qavat` : '—'}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400 font-mono">{u.phone || '—'}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {u.last_login ? format(new Date(u.last_login), 'dd.MM.yyyy HH:mm') : 'Hali kirmagan'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setPassModal(u); setNewPass(''); }} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-amber-400 hover:text-amber-300" title="Parol o'zgartirish">
                        <Key size={13} />
                      </button>
                      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-blue-400 hover:text-blue-300">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-red-400 hover:text-red-300">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white text-lg">
                {modal === 'add' ? 'Yangi foydalanuvchi' : 'Tahrirlash'}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl btn-ghost flex items-center justify-center text-slate-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'full_name', label: 'To\'liq ism *', placeholder: 'Rahimov Jasur' },
                { key: 'username', label: 'Login *', placeholder: 'jasur_sardor', disabled: modal === 'edit' },
                { key: 'phone', label: 'Telefon', placeholder: '+998901234567' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} disabled={f.disabled}
                    className="glass-input w-full px-3 py-2 text-sm disabled:opacity-50" />
                </div>
              ))}
              {modal === 'add' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Parol *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Kamida 4 belgi" className="glass-input w-full px-3 py-2 text-sm" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Rol *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="glass-input w-full px-3 py-2 text-sm">
                  {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.role === 'sardor' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Qavat *</label>
                  <select value={form.floor_number} onChange={e => setForm({ ...form, floor_number: e.target.value })}
                    className="glass-input w-full px-3 py-2 text-sm">
                    <option value="">Tanlang</option>
                    {floors.map(f => <option key={f.id} value={f.floor_number}>{f.name}</option>)}
                  </select>
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

      {/* Password modal */}
      {passModal && (
        <div className="modal-overlay" onClick={() => setPassModal(null)}>
          <div className="modal-content p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-white text-lg mb-2">Parol o'zgartirish</h3>
            <p className="text-sm text-slate-400 mb-4">{passModal.full_name} uchun yangi parol</p>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder="Yangi parol (kamida 4 belgi)" className="glass-input w-full px-3 py-2 text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setPassModal(null)} className="btn-ghost flex-1 py-2.5 text-sm">Bekor</button>
              <button onClick={handlePassChange} className="btn-primary flex-1 py-2.5 text-sm">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
