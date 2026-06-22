import { Link } from 'react-router-dom';
import { Building2, Shield, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "O'quvchilar hisobi",
      desc: "Barcha talabalar ro'yxatini va ularning yotoqxonadagi holatini qulay boshqarish."
    },
    {
      icon: Clock,
      title: "Raqamli davomat",
      desc: "Har kunlik davomatni tezkor belgilash va avtomatik hisobotlar tayyorlash."
    },
    {
      icon: Shield,
      title: "Xavfsizlik",
      desc: "Tizimdagi barcha ma'lumotlar maxfiy himoyalangan va rollarga ajratilgan holda ko'rsatiladi."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080c1a] text-slate-200 overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background elements - Only animated on desktop (md:block) to save mobile performance */}
      <div className="hidden md:block absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="hidden md:block absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none" style={{ animation: 'float 8s infinite alternate' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#080c1a]/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
              <Building2 className="text-blue-400" size={24} />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">TATU B-Blok</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Boshqaruv paneli
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center gap-2">
              Tizimga kirish <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            TATU Yotoqxona Tizimi v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
            Yotoqxonani <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">zamonaviy</span> usulda boshqaring
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Talabalar hisobi, kunlik davomat, xonalar nazorati va qavat sardorlari uchun qulaylashtirilgan yagona markazlashgan tizim.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
              Boshlash <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {features.map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <feature.icon className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-32 p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Nega aynan ushbu tizim?</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Qog'ozbozlikdan voz keching. Barcha ma'lumotlar xavfsiz serverda saqlanadi va istalgan qurilmadan tezkor kirish imkoniyati mavjud.
            </p>
            <ul className="space-y-3">
              {['Qavat sardorlari uchun qulaylik', 'VVaizlarni 80% gacha tejash', 'Ota-onalarga aniq ma\'lumot berish', 'Tezkor qidiruv va filtrlar'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <CheckCircle2 className="text-blue-400" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/2 relative hidden sm:block">
            {/* Abstract visual representation of dashboard */}
            <div className="aspect-video rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-1/3 bg-white/10 rounded" />
                <div className="h-20 w-full bg-blue-500/20 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-white/5 rounded-xl" />
                  <div className="h-16 bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 bg-[#080c1a]/80 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-slate-500" size={20} />
            <span className="text-slate-400 font-semibold text-sm">TATU B-Blok Yotoqxonasi</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
