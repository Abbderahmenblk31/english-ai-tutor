import React from 'react';
import { PERSONAS } from '../data/personas';
import { TOPICS } from '../data/topics';
import { Users, Compass, Award, RotateCcw, X, Mic2, Sparkles, BookOpen, BookMarked, Settings, Trash2, Cloud, FileText, User } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
  activeTopic,
  onSelectTopic,
  userLevel,
  onChangeLevel,
  onResetChat,
  onOpenSettings,
  onOpenVocabulary,
  stats,
  uiLang = 'ar',
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenPlacementTest,
  onOpenLessonSummary
}) {
  const isRtl = uiLang === 'ar';

  const levels = [
    { id: 'Beginner', label: 'Beginner (A1-A2)', labelAr: 'مبتدئ (A1-A2)' },
    { id: 'Intermediate', label: 'Intermediate (B1-B2)', labelAr: 'متوسط (B1-B2)' },
    { id: 'Advanced', label: 'Advanced (C1-C2)', labelAr: 'متقدم (C1-C2)' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 flex w-80 flex-col border-r border-l border-slate-800 bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-white">
              {isRtl ? 'الأستاذ والسيناريو' : 'Tutors & Scenarios'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity & Cloud Sync Card */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
          {user && !user.isGuest ? (
            <div 
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                if (onOpenProfile) onOpenProfile();
              }}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-indigo-400"
                  />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Cloud className="w-3 h-3" />
                    <span>{isRtl ? 'سحابة Google متصلة' : 'Google Cloud Active'}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md font-bold shrink-0">
                {isRtl ? 'ملفي' : 'Profile'}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-purple-950/40 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">
                  {isRtl ? 'حساب ضيف (محلي)' : 'Guest Mode (Local)'}
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  {isRtl ? 'غير متزامن' : 'Unsynced'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{isRtl ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Level Selector & Diagnostic Test */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400">
                {isRtl ? 'مستواك الإنجليزي:' : 'Your Level:'}
              </label>
              {onOpenPlacementTest && (
                <button
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                    onOpenPlacementTest();
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'اختبار المستوى الذكي' : 'Diagnostic Test'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onChangeLevel(lvl.id)}
                  className={`rounded-lg py-1.5 text-center text-xs font-medium transition ${
                    userLevel === lvl.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          {/* Tutor Personas List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {isRtl ? 'اختر شخصية الأستاذ:' : 'Choose AI Tutor:'}
              </span>
            </div>

            <div className="space-y-2">
              {PERSONAS.map((p) => {
                const isSelected = activePersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full text-left rounded-2xl p-3 transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{p.name}</span>
                          <span className="text-[10px] text-indigo-300 font-mono">
                            {p.accent === 'en-GB' ? '🇬🇧' : '🇺🇸'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{isRtl ? p.roleAr : p.role}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {isRtl ? p.vibeAr : p.vibe}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {isRtl ? 'موضوعات المحادثة:' : 'Scenarios & Topics:'}
              </span>
            </div>

            <div className="space-y-1.5">
              {TOPICS.map((topic) => {
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      onSelectTopic(topic);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full text-left rounded-xl p-2.5 transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/30 border-slate-800/60 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {isRtl ? topic.titleAr : topic.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {isRtl ? topic.categoryAr : topic.category}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded shrink-0">
                      {topic.level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Mobile Quick Actions */}
        <div className="border-t border-slate-800 p-3 bg-slate-950 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {onOpenLessonSummary && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLessonSummary();
                }}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 border border-slate-800 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800 transition"
                title="تصدير ملخص الدرس"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">{isRtl ? 'الملخص' : 'Summary'}</span>
              </button>
            )}

            {onOpenVocabulary && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVocabulary();
                }}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 border border-slate-800 py-2 text-xs font-semibold text-purple-300 hover:bg-slate-800 transition"
              >
                <BookMarked className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px]">{isRtl ? 'المفردات' : 'Vault'}</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 border border-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">{isRtl ? 'الإعدادات' : 'Settings'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onResetChat();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{isRtl ? 'فسخ المحادثة والبدء من جديد' : 'Clear Chat & Start Fresh'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
