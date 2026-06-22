import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Building2, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({ username: '', newPassword: '', secretKey: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Login va parolni kiriting');
      return;
    }
    const res = await login(form.username, form.password);
    if (res.success) {
      toast.success('Xush kelibsiz!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.username || !resetForm.newPassword || !resetForm.secretKey) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.post('/auth/reset-password', resetForm);
      toast.success(res.data.message);
      setResetModal(false);
      setResetForm({ username: '', newPassword: '', secretKey: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="hidden md:block bg-blob w-96 h-96 bg-blue-600 top-[-100px] left-[-100px]" style={{ animationDelay: '0s' }} />
      <div className="hidden md:block bg-blob w-80 h-80 bg-indigo-500 bottom-[-80px] right-[-80px]" style={{ animationDelay: '2s' }} />
      <div className="hidden md:block bg-blob w-64 h-64 bg-cyan-500 top-1/2 left-1/2" style={{ animationDelay: '4s', opacity: 0.08 }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, rgba(51,143,255,0.2), rgba(26,110,245,0.1))', border: '1px solid rgba(51,143,255,0.3)', boxShadow: '0 0 40px rgba(51,143,255,0.2)' }}>
            <Building2 size={36} className="text-blue-400" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Shield size={10} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-1">
            TATU B-Blok
          </h1>
          <p className="text-slate-400 text-sm">Yotoqxona Boshqaruv Tizimi</p>
        </div>

        {/* Card */}
        <div className="modal-content p-8">
          <div className="mb-6">
            <h2 className="text-xl font-display font-semibold text-white mb-1">Tizimga kirish</h2>
            <p className="text-slate-500 text-sm">Login va parolingizni kiriting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Login</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Loginni kiriting"
                className="glass-input w-full px-4 py-3 text-sm"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="glass-input w-full px-4 py-3 text-sm pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setResetModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Parolni unutdingizmi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Kirish
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">Tizim faol ishlayapti</span>
          </div>
        </div>

        {resetModal && (
          <div className="modal-overlay" onClick={() => setResetModal(false)}>
            <div className="modal-content p-6 max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-semibold text-white text-lg mb-4">Parolni tiklash</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Login</label>
                  <input type="text" value={resetForm.username} onChange={e => setResetForm({...resetForm, username: e.target.value})} placeholder="admin" className="glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Yangi parol</label>
                  <input type="password" value={resetForm.newPassword} onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} placeholder="Yangi parol" className="glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Maxfiy kalit (Secret Key)</label>
                  <input type="password" value={resetForm.secretKey} onChange={e => setResetForm({...resetForm, secretKey: e.target.value})} placeholder="Kalitni kiriting" className="glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setResetModal(false)} className="btn-ghost flex-1 py-2 text-sm">Bekor</button>
                  <button onClick={handleResetPassword} disabled={resetLoading} className="btn-primary flex-1 py-2 text-sm">Tiklash</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 TATU Yotoqxona • Barcha huquqlar himoyalangan
          @azizillo_nabiyev
        </p>
      </div>
    </div>
  );
}
