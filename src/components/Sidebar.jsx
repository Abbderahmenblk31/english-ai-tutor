import React from 'react';
import { PERSONAS } from '../data/personas';
import { TOPICS } from '../data/topics';
import { Users, Compass, Award, RotateCcw, X, Mic2, Sparkles, BookOpen } from 'lucide-react';

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
  stats,
  uiLang = 'ar'
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Level Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>{isRtl ? 'مستواك الحالي:' : 'Your English Level:'}</span>
              <span className="text-[10px] text-indigo-400 uppercase font-bold">{userLevel}</span>
            </label>
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
                  {isRtl ? lvl.id : lvl.id}
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
                    className={`w-full text-left rounded-2xl p-2.5 transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-semibold text-xs truncate ${isSelected ? 'text-indigo-300 font-bold' : 'text-slate-200'}`}>
                          {p.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {p.accent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {isRtl ? p.titleAr : p.title}
                      </p>

                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                          {isRtl ? p.badgeAr : p.badge}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics & Scenarios List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {isRtl ? 'موضوع / سيناريو المحادثة:' : 'Practice Scenario:'}
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

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-3 bg-slate-950">
          <button
            onClick={onResetChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-rose-950/30 hover:border-rose-800/50 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'بدء محادثة جديدة وتصفير الشات' : 'Start Fresh Session'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
