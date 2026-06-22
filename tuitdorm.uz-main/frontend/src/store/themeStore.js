import { create } from 'zustand';

const applyTheme = (theme) => {
  if (theme === 'light') {
    document.documentElement.classList.add('light-mode');
    document.body.style.background = '#f1f5f9';
    document.body.style.color = '#0f172a';
  } else {
    document.documentElement.classList.remove('light-mode');
    document.body.style.background = '#080c1a';
    document.body.style.color = '#e2e8f0';
  }
};

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark',
  lang: localStorage.getItem('lang') || 'uz',
  dashboardPrefs: JSON.parse(localStorage.getItem('dashboardPrefs') || '{"showStats":true,"showTrend":true,"showFloors":true,"showTable":true}'),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
    window.location.reload();
  },

  setDashboardPrefs: (prefs) => {
    localStorage.setItem('dashboardPrefs', JSON.stringify(prefs));
    set({ dashboardPrefs: prefs });
  },
}));

export { applyTheme };
export default useThemeStore;
