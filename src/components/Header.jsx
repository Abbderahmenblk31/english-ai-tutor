import React from 'react';
import { Flame, Sparkles, BookMarked, Settings, Volume2, VolumeX, Globe, Menu, ShieldCheck, Trash2 } from 'lucide-react';

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
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-2.5 sm:px-4 backdrop-blur-xl transition-all">
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

      {/* Right side: Provider badge, Vocabulary Vault, Sound, Language, Settings */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Provider Indicator (Desktop only) */}
        <button
          onClick={onOpenSettings}
          className={`hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition hover:opacity-80 ${providerLabel.color}`}
          title="انقر لتعديل إعدادات الذكاء الاصطناعي والمفاتيح"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
          <span>{providerLabel.name}</span>
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

        {/* Clear Chat Button (Visible on screens from tablet up; on mobile it is in the chat banner and drawer!) */}
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
      </div>
    </header>
  );
}
