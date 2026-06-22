import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Save, User, Lock, AtSign, Clock, Monitor, Sun, Moon, Camera, Phone, Shield, Globe, LayoutDashboard, Check } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme, lang, setLang, dashboardPrefs, setDashboardPrefs } = useThemeStore();
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [usernameForm, setUsernameForm] = useState({ new_username: '' });
  const [phoneForm, setPhoneForm] = useState({ phone: user?.phone || '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/users/login-logs').then(r => setLoginLogs(r.data.slice(0, 10))).catch(() => {});
  }, []);

  const handlePassChange = async () => {
    if (!passForm.old_password || !passForm.new_password) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    if (passForm.new_password !== passForm.confirm) { toast.error('Yangi parollar mos kelmadi'); return; }
    if (passForm.new_password.length < 4) { toast.error('Parol kamida 4 ta belgi'); return; }
    setLoading(true);
    try {
      await api.put('/auth/password', { old_password: passForm.old_password, new_password: passForm.new_password });
      toast.success('Parol muvaffaqiyatli yangilandi');
      setPassForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
    setLoading(false);
  };

  const handleUsernameChange = async () => {
    if (!usernameForm.new_username || usernameForm.new_username.length < 3) { toast.error('Login kamida 3 ta belgi'); return; }
    setUsernameLoading(true);
    try {
      await api.put('/users/update-username', { new_username: usernameForm.new_username });
      updateUser({ ...user, username: usernameForm.new_username });
      toast.success('Login muvaffaqiyatli yangilandi');
      setUsernameForm({ new_username: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
    setUsernameLoading(false);
  };

  const handlePhoneChange = async () => {
    setPhoneLoading(true);
    try {
      await api.put('/users/' + user.id, { full_name: user.full_name, phone: phoneForm.phone, floor_number: user.floor_number });
      updateUser({ ...user, phone: phoneForm.phone });
      toast.success('Telefon yangilandi');
    } catch (err) { toast.error(err.response?.data?.message || 'Xato'); }
    setPhoneLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Fayl hajmi 2MB dan oshmasin"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      localStorage.setItem('avatar_' + user.id, ev.target.result);
      updateUser({ ...user, avatar: ev.target.result });
      toast.success('Profil rasmi yangilandi');
    };
    reader.readAsDataURL(file);
  };

  const avatar = user?.avatar || localStorage.getItem('avatar_' + user?.id);
  const roleLabels = { superadmin: 'Blok Hokimi', sardor: 'Qavat Sardori', viewer: 'Kuzatuvchi' };

  const togglePref = (key) => {
    const updated = { ...dashboardPrefs, [key]: !dashboardPrefs[key] };
    setDashboardPrefs(updated);
    toast.success('Saqlandi');
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title text-2xl">Sozlamalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Profil va tizim sozlamalari</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-blue-400" />
          <h3 className="font-display font-semibold text-white">Profil</h3>
        </div>
        <div className="flex items-center gap-5 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500/30 flex items-center justify-center" style={{ background: 'rgba(51,143,255,0.15)' }}>
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-blue-300">{user?.full_name?.charAt(0)}</span>}
            </div>
            <button onClick={() => fileRef.current.click()} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl btn-primary flex items-center justify-center">
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg">{user?.full_name}</div>
            <div className="text-sm text-slate-400">@{user?.username}</div>
            <div className="text-xs text-blue-400 mt-1">{roleLabels[user?.role]}{user?.floor_number ? ' - ' + user.floor_number + '-qavat' : ''}</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Phone size={18} className="text-green-400" />
          <h3 className="font-display font-semibold text-white">Telefon raqami</h3>
        </div>
        <div className="flex gap-3">
          <input value={phoneForm.phone} onChange={e => setPhoneForm({ phone: e.target.value })} placeholder="+998901234567" className="glass-input flex-1 px-4 py-2.5 text-sm" />
          <button onClick={handlePhoneChange} disabled={phoneLoading} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            {phoneLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Saqlash
          </button>
        </div>
      </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'dark', label: 'Dark Mode', icon: Moon, desc: "Qorong'u tema", activeBg: 'rgba(51,143,255,0.15)', activeBorder: 'rgba(51,143,255,0.4)', color: 'text-blue-400' },
            { key: 'light', label: 'Light Mode', icon: Sun, desc: "Yorug' tema", activeBg: 'rgba(245,158,11,0.15)', activeBorder: 'rgba(245,158,11,0.4)', color: 'text-amber-400' },
          ].map(t => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className={'p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all relative ' + (theme === t.key ? t.color : 'text-slate-500 border-white/8')}
              style={theme === t.key ? { background: t.activeBg, borderColor: t.activeBorder } : { background: 'rgba(255,255,255,0.03)' }}>
              {theme === t.key && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
              <t.icon size={24} />
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs opacity-70">{t.desc}</div>
            </button>
          ))}
        </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard size={18} className="text-orange-400" />
          <h3 className="font-display font-semibold text-white">Dashboard ko'rinishi</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'showStats', label: "Statistika kartalarini ko'rsatish", desc: "Jami, Bor, Yo'q, Belgilanmagan" },
            { key: 'showTrend', label: '7 kunlik trend grafigi', desc: 'Haftalik davomat grafigi' },
            { key: 'showFloors', label: "Qavatlar bo'yicha grafik", desc: 'Bar chart' },
            { key: 'showTable', label: "Qavatlar jadvalini ko'rsatish", desc: 'Batafsil qavat statistikasi' },
          ].map(p => (
            <div key={p.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div className="text-sm text-white font-medium">{p.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
              </div>
              <button onClick={() => togglePref(p.key)}
                className={'w-12 h-6 rounded-full transition-all relative flex-shrink-0 ml-3 ' + (dashboardPrefs[p.key] ? 'bg-blue-500' : 'bg-white/10')}>
                <div className={'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ' + (dashboardPrefs[p.key] ? 'left-6' : 'left-0.5')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AtSign size={18} className="text-blue-400" />
          <h3 className="font-display font-semibold text-white">Login ozgartirish</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Hozirgi login</label>
            <input value={user?.username} disabled className="glass-input w-full px-4 py-2.5 text-sm opacity-50 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Yangi login</label>
            <input value={usernameForm.new_username} onChange={e => setUsernameForm({ new_username: e.target.value })} placeholder="Yangi login (kamida 3 belgi)" className="glass-input w-full px-4 py-2.5 text-sm" />
          </div>
          <button onClick={handleUsernameChange} disabled={usernameLoading} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            {usernameLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Loginni saqlash
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-amber-400" />
          <h3 className="font-display font-semibold text-white">Parol ozgartirish</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Eski parol</label>
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={passForm.old_password} onChange={e => setPassForm({ ...passForm, old_password: e.target.value })} placeholder="xxxxxxxx" className="glass-input w-full px-4 py-2.5 text-sm pr-10" />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Yangi parol</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={passForm.new_password} onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} placeholder="Kamida 4 belgi" className="glass-input w-full px-4 py-2.5 text-sm pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Yangi parolni takrorlang</label>
            <input type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} placeholder="xxxxxxxx" className="glass-input w-full px-4 py-2.5 text-sm" />
          </div>
          <button onClick={handlePassChange} disabled={loading} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Parolni saqlash
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <Clock size={18} className="text-slate-400" />
          <h3 className="font-display font-semibold text-white">Login tarixi</h3>
          <span className="text-xs text-slate-500">Oxirgi 10 ta kirish</span>
        </div>
        <div className="divide-y divide-white/5">
          {loginLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Tarix yoq</div>
          ) : loginLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className={'w-2 h-2 rounded-full ' + (log.status === 'success' ? 'bg-green-400' : 'bg-red-400')} />
                <div>
                  <div className="text-sm text-white font-mono">{log.ip_address || '-'}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{log.user_agent?.split('/')[0] || '-'}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">{log.created_at ? format(new Date(log.created_at), 'dd.MM.yyyy HH:mm') : '-'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-red-400" />
          <h3 className="font-display font-semibold text-white">Faol seans</h3>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div>
              <div className="text-sm text-white">Joriy seans</div>
              <div className="text-xs text-slate-400">Hozir faol - {user?.username}</div>
            </div>
          </div>
          <span className="text-xs text-green-400 font-medium px-2 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>Online</span>
        </div>
      </div>
    </div>
  );
}
