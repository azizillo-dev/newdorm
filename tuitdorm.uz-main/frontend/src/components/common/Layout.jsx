import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, ClipboardCheck,
  BarChart3, Settings, LogOut, Menu, X, ChevronDown,
  CalendarDays, UserCog, AlertTriangle, Trash2, Moon, Sun
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';

const navItemsUz = {
  superadmin: [
    { group: 'Asosiy', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    ]},
    { group: 'Boshqaruv', items: [
      { to: '/students', icon: Users, label: "O'quvchilar" },
      { to: '/floors', icon: Building2, label: 'Qavatlar' },
      { to: '/users', icon: UserCog, label: 'Foydalanuvchilar' },
    ]},
    { group: 'Tahlil', items: [
      { to: '/reports', icon: BarChart3, label: 'Hisobotlar' },
      { to: '/alerts', icon: AlertTriangle, label: 'Ogohlantirishlar' },
      { to: '/trash', icon: Trash2, label: 'Axlat navbati' },
      { to: '/holidays', icon: CalendarDays, label: 'Dam olish kunlari' },
    ]},
    { group: 'Tizim', items: [
      { to: '/settings', icon: Settings, label: 'Sozlamalar' },
    ]},
  ],
  sardor: [
    { group: 'Asosiy', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    ]},
    { group: 'Boshqaruv', items: [
      { to: '/students', icon: Users, label: "O'quvchilar" },
    ]},
    { group: 'Tahlil', items: [
      { to: '/reports', icon: BarChart3, label: 'Hisobotlar' },
      { to: '/alerts', icon: AlertTriangle, label: 'Ogohlantirishlar' },
      { to: '/trash', icon: Trash2, label: 'Axlat navbati' },
    ]},
    { group: 'Tizim', items: [
      { to: '/settings', icon: Settings, label: 'Sozlamalar' },
    ]},
  ],
  viewer: [
    { group: 'Asosiy', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    ]},
  ],
};

const navItemsRu = {
  superadmin: [
    { group: 'Основное', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Главная' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Посещаемость' },
    ]},
    { group: 'Управление', items: [
      { to: '/students', icon: Users, label: 'Студенты' },
      { to: '/floors', icon: Building2, label: 'Этажи' },
      { to: '/users', icon: UserCog, label: 'Пользователи' },
    ]},
    { group: 'Аналитика', items: [
      { to: '/reports', icon: BarChart3, label: 'Отчёты' },
      { to: '/alerts', icon: AlertTriangle, label: 'Уведомления' },
      { to: '/trash', icon: Trash2, label: 'График уборки' },
      { to: '/holidays', icon: CalendarDays, label: 'Выходные дни' },
    ]},
    { group: 'Система', items: [
      { to: '/settings', icon: Settings, label: 'Настройки' },
    ]},
  ],
  sardor: [
    { group: 'Основное', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Главная' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Посещаемость' },
    ]},
    { group: 'Управление', items: [
      { to: '/students', icon: Users, label: 'Студенты' },
    ]},
    { group: 'Аналитика', items: [
      { to: '/reports', icon: BarChart3, label: 'Отчёты' },
      { to: '/alerts', icon: AlertTriangle, label: 'Уведомления' },
      { to: '/trash', icon: Trash2, label: 'График уборки' },
    ]},
    { group: 'Система', items: [
      { to: '/settings', icon: Settings, label: 'Настройки' },
    ]},
  ],
  viewer: [
    { group: 'Основное', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Главная' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Посещаемость' },
    ]},
  ],
};

const roleLabelsUz = { superadmin: 'Blok Hokimi', sardor: 'Qavat Sardori', viewer: 'Kuzatuvchi' };
const roleLabelsRu = { superadmin: 'Администратор', sardor: 'Старший этажа', viewer: 'Наблюдатель' };
const roleBadgeColors = {
  superadmin: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  sardor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewer: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, setTheme, lang } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success(lang === 'ru' ? 'Выход выполнен' : 'Chiqildi');
    navigate('/login');
  };

  const navItems = lang === 'ru' ? navItemsRu : navItemsUz;
  const roleLabels = lang === 'ru' ? roleLabelsRu : roleLabelsUz;
  const items = navItems[user?.role] || navItems.viewer;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(51,143,255,0.2)', border: '1px solid rgba(51,143,255,0.3)' }}>
            <Building2 size={20} className="text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-display font-bold text-white">TATU Yotoqxona</div>
            <div className="text-xs text-slate-500">{lang === 'ru' ? 'Система общежития' : 'Yotoqxona tizimi'}</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="glass-card p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-300">{user?.full_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.full_name}</div>
              <div className={`text-xs px-2 py-0.5 rounded-md border inline-block mt-0.5 ${roleBadgeColors[user?.role]}`}>
                {roleLabels[user?.role]}
                {user?.role === 'sardor' && user?.floor_number && ` • ${user.floor_number}-${lang === 'ru' ? 'эт' : 'qavat'}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-3 overflow-y-auto scrollbar-thin">
        {items.map((group) => (
          <div key={group.group} className="mb-4">
            <div className="section-label mb-2">{group.group}</div>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}>
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={17} />
          <span>{lang === 'ru' ? 'Выйти' : 'Chiqish'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex relative">
      <div className="hidden md:block bg-blob w-[600px] h-[600px] bg-blue-900 top-0 left-0 opacity-10" />
      <div className="hidden md:block bg-blob w-[400px] h-[400px] bg-indigo-900 bottom-0 right-0 opacity-10" style={{ animationDelay: '3s' }} />

      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 relative z-20 sticky top-0 h-screen"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,12,26,0.8)', backdropFilter: 'blur(20px)' }}>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 flex flex-col"
            style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="flex items-center gap-4 px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,12,26,0.6)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center btn-ghost">
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">

            {/* Theme toggle - kichik */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark'
                ? <Moon size={16} className="text-blue-300" />
                : <Sun size={16} className="text-amber-400" />
              }
            </button>

            {/* Til toggle - kichik */}
            <button
              onClick={() => { const newLang = lang === 'uz' ? 'ru' : 'uz'; localStorage.setItem('lang', newLang); window.location.reload(); }}
              className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              title={lang === 'uz' ? "Русский" : "O'zbek"}>
              <span>{lang === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
              <span className="text-slate-300">{lang === 'uz' ? "UZ" : "RU"}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CalendarDays size={13} />
              {new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => navigate('/settings')}>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/40 to-indigo-500/40 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-300">{user?.full_name?.charAt(0)}</span>
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-300">{user?.full_name}</span>
              <ChevronDown size={13} className="text-slate-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 lg:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
