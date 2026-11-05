import React from 'react';
import { Flame, Sparkles, BookMarked, Settings, Volume2, VolumeX, Globe, Menu, ShieldCheck, Trash2, Cloud, User, FileText, Award } from 'lucide-react';

export default function Header({
  stats,
  settings,
  onOpenSettings,
  onOpenVocabulary,
  onToggleSound,
  onToggleSidebar,
  onResetChat,
  savedWordsCount = 0,
  activePersona,
  onToggleLanguage,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenLessonSummary,
  onOpenPlacementTest
}) {
  const isRtl = settings.uiLanguage === 'ar';

  const getProviderInfo = () => {
    if (settings.provider === 'gemini' && settings.geminiKey?.trim()) {
      return { name: 'Gemini 3.8 Flash (Active)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (settings.provider === 'groq' && settings.groqKey?.trim()) {
      return { name: 'Groq Llama 3.3', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
    if (settings.provider === 'ollama') {
      return { name: 'Ollama Offline', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    if (settings.provider === 'openai' && settings.openaiKey?.trim()) {
      return { name: 'OpenAI Active', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    return { name: 'Free Cloud AI (GPT-4o)', color: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30' };
  };

  const providerLabel = getProviderInfo();

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-2 sm:px-4 backdrop-blur-xl transition-all">
      {/* Left side: Menu button + Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition lg:hidden"
          title="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Fluently</span>
              <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xl:block">
              {isRtl ? 'أستاذ الإنجليزية الذكي ومصحح المحادثة الفوري' : 'AI English Conversation Tutor'}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Mobile Compact Streak Badge */}
      <div className="flex md:hidden items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-full px-2 py-0.5 text-xs font-bold text-orange-400 shrink-0 shadow-sm" title="أيام الممارسة المتتالية">
        <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
        <span>{stats.streakDays || 1}</span>
      </div>

      {/* Center: Desktop Full Streak & Goal Progress */}
      <div className="hidden md:flex items-center gap-3 lg:gap-4 bg-slate-900/60 border border-slate-800/80 rounded-full px-3.5 py-1.5 shrink-0">
        <div className="flex items-center gap-1.5" title="أيام الممارسة المتتالية">
          <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
          <span className="text-xs font-bold text-orange-400">
            {stats.streakDays || 1} {isRtl ? 'أيام متتالية' : 'Day Streak'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {isRtl ? 'الهدف اليومي:' : 'Daily Goal:'}
          </span>
          <div className="w-16 lg:w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((stats.dailyProgress || 0) / (stats.dailyGoal || 10)) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-300">
            {stats.dailyProgress || 0}/{stats.dailyGoal || 10}
          </span>
        </div>
      </div>

      {/* Right side: Actions, Vocabulary, Google Auth / Profile */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Lesson Summary Export Button */}
        <button
          onClick={onOpenLessonSummary}
          className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title={isRtl ? 'عرض وتصدير ملخص الدرس' : 'Lesson Study Summary'}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="hidden xl:inline">{isRtl ? 'الملخص' : 'Summary'}</span>
        </button>

        {/* CEFR Level Assessment Shortcut */}
        <button
          onClick={onOpenPlacementTest}
          className="hidden xl:flex items-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
          title={isRtl ? 'إجراء اختبار تحديد المستوى' : 'CEFR Placement Test'}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{settings.userLevel || 'Intermediate'}</span>
        </button>

        {/* Vocabulary Vault Button */}
        <button
          onClick={onOpenVocabulary}
          className="relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title={isRtl ? 'سجل الكلمات والمفردات المحفوظة' : 'Vocabulary Vault'}
        >
          <BookMarked className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline mr-1">{isRtl ? 'المفردات' : 'Vault'}</span>
          {savedWordsCount > 0 && (
            <span className="absolute -top-1 -right-1 sm:static sm:mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-bold text-white shadow">
              {savedWordsCount}
            </span>
          )}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`rounded-xl p-2 transition ${
            settings.autoSpeak
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
          title={settings.autoSpeak ? (isRtl ? 'النطق التلقائي مفعّل' : 'Auto-speak enabled') : (isRtl ? 'النطق التلقائي معطّل' : 'Auto-speak muted')}
        >
          {settings.autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Language switch */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2 py-1.5 sm:px-2.5 sm:py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title="Toggle Interface Language"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px]">{settings.uiLanguage === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Clear Chat Button (Tablet and Desktop) */}
        <button
          onClick={onResetChat}
          className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-300 transition shadow-sm"
          title={isRtl ? 'فسخ المحادثة والبدء من جديد' : 'Clear Chat & Start Fresh'}
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">{isRtl ? 'فسخ' : 'Clear'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title="Settings / الإعدادات"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Google Auth / User Profile Button (Output of Session 2) */}
        {user && !user.isGuest ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 hover:border-indigo-400 p-1 sm:px-2 sm:py-1 transition shadow-sm"
            title={isRtl ? 'حسابك الشخصي والمزامنة السحابية' : 'User Profile & Cloud Sync'}
          >
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces'}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-indigo-400/80"
              />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[80px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <Cloud className="w-3.5 h-3.5 text-indigo-400 hidden md:inline" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-slate-700 hover:border-slate-500 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-white transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title={isRtl ? 'تسجيل الدخول عبر Google للمزامنة السحابية' : 'Sign in with Google for Cloud Sync'}
          >
            {/* Google G Icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span className="hidden sm:inline">{isRtl ? 'دخول Google' : 'Sign in'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
