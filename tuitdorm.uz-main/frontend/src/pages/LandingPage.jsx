import { Link } from 'react-router-dom';
import { Building2, Shield, Users, Clock, ArrowRight, Server, Database, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Talabalar Bazasi",
      desc: "Barcha talabalar ro'yxati va ularning yotoqxonadagi holatini tizimli boshqarish."
    },
    {
      icon: Clock,
      title: "Raqamli Davomat",
      desc: "Kunlik davomatni tezkor belgilash va avtomatik hisobotlar tayyorlash."
    },
    {
      icon: Shield,
      title: "Yuqori Xavfsizlik",
      desc: "Ma'lumotlar shifrlangan holda saqlanadi va maxsus rollarga ajratilgan holda ko'rsatiladi."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-slate-300 overflow-x-hidden font-sans selection:bg-blue-500/30 relative">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#050914]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Building2 className="text-blue-400" size={22} />
            </div>
            <span className="font-semibold text-lg text-white">TATU B-Blok</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Boshqaruv paneli
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Tizimga kirish <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            TATU Yotoqxona Tizimi v2.0
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-normal">
            Yotoqxonani boshqarishning <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">zamonaviy IT yechimi</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
            Talabalar hisobi, kunlik davomat, xonalar nazorati va qavat sardorlari uchun qulaylashtirilgan yagona markazlashgan axborot tizimi.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-base transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              Tizimga kirish <ArrowRight size={18} />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-base border border-white/10 transition-all flex items-center justify-center">
              Imkoniyatlar
            </a>
          </div>
        </div>

        {/* Tech Animation Floating Elements */}
        <div className={`mt-24 relative h-[300px] md:h-[400px] w-full max-w-4xl mx-auto rounded-3xl border border-white/5 bg-gradient-to-b from-[#0f172a]/40 to-[#030712]/40 backdrop-blur-md overflow-hidden flex items-center justify-center transition-all duration-1000 delay-200 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0,transparent_100%)]" />
          
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Center Server */}
            <div className="absolute w-20 h-20 rounded-2xl bg-[#0f172a] border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] z-20 animate-pulse">
              <Server className="text-blue-400" size={32} />
            </div>

            {/* Orbiting Circles */}
            <div className="absolute w-[280px] h-[280px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse] hidden md:block" />

            {/* Floating Nodes */}
            <div className="absolute top-[20%] left-[20%] w-14 h-14 rounded-xl bg-[#0f172a] border border-indigo-500/30 flex items-center justify-center animate-[float_4s_ease-in-out_infinite] z-10 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <Database className="text-indigo-400" size={24} />
            </div>
            
            <div className="absolute bottom-[20%] right-[20%] w-14 h-14 rounded-xl bg-[#0f172a] border border-emerald-500/30 flex items-center justify-center animate-[float_5s_ease-in-out_infinite_reverse] z-10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Lock className="text-emerald-400" size={24} />
            </div>

            <div className="absolute top-[25%] right-[25%] md:right-[20%] w-12 h-12 rounded-xl bg-[#0f172a] border border-purple-500/30 flex items-center justify-center animate-[float_6s_ease-in-out_infinite] z-10 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <Users className="text-purple-400" size={20} />
            </div>

            <div className="absolute bottom-[25%] left-[25%] md:left-[20%] w-12 h-12 rounded-xl bg-[#0f172a] border border-sky-500/30 flex items-center justify-center animate-[float_7s_ease-in-out_infinite_reverse] z-10 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
              <Shield className="text-sky-400" size={20} />
            </div>

            {/* Connecting lines SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="url(#blue-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
              <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="url(#emerald-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite_reverse]" />
              <line x1="75%" y1="25%" x2="50%" y2="50%" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
              <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="url(#sky-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite_reverse]" />
              <defs>
                <linearGradient id="blue-grad">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="emerald-grad">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="purple-grad">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="sky-grad">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className={`mt-32 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {features.map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:border-blue-500/20 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-light">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-[#030712] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-slate-600" size={18} />
            <span className="text-slate-500 font-medium text-sm">TATU B-Blok Yotoqxonasi</span>
          </div>
          <div className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Axborot Tizimi. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
}
