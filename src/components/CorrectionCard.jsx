import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Volume2, BookmarkPlus, ChevronDown, ChevronUp, BookOpen, VolumeX } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function CorrectionCard({
  feedback,
  persona,
  onSaveWord,
  savedWords = [],
  accent = 'en-US',
  uiLang = 'ar'
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showArabicExplanation, setShowArabicExplanation] = useState(true);
  const [playingWord, setPlayingWord] = useState(null);

  if (!feedback) return null;

  const { hasMistakes, corrections = [], nativeAlternative, nativeAlternativeAr, vocabularyBoost = [], pronunciationTips = [], cefrLevel, examScore } = feedback;

  const playAudio = (text) => {
    setPlayingWord(text);
    speechService.speak(text, {
      persona,
      accent: persona?.accent || accent,
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null)
    });
  };

  const isRtl = uiLang === 'ar';

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950/80 p-4 shadow-xl backdrop-blur-md transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
        <div className="flex items-center gap-2.5">
          {hasMistakes ? (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحسينات وقواعد مقترحة' : 'Smart Corrections'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'صياغة ممتازة وسليمة!' : 'Flawless Grammar!'}</span>
            </div>
          )}

          {cefrLevel && (
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
              CEFR: {cefrLevel}
            </span>
          )}

          {examScore && (
            <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300 border border-purple-500/30">
              {examScore}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArabicExplanation(!showArabicExplanation)}
            className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition-colors bg-slate-800/60 px-2 py-1 rounded border border-slate-700/50"
            title="تبديل لغة الشرح"
          >
            {showArabicExplanation ? 'العربية' : 'English'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3.5 text-sm">
          {/* Corrections List */}
          {hasMistakes && corrections.length > 0 && (
            <div className="space-y-2.5">
              {corrections.map((corr, idx) => (
                <div key={idx} className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-mono">
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-300 line-through">
                      {corr.original}
                    </span>
                    <span className="text-slate-500">➔</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300 flex items-center gap-1.5">
                      {corr.corrected}
                      <button
                        onClick={() => playAudio(corr.corrected)}
                        className="text-emerald-400 hover:text-emerald-200 transition-colors"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {showArabicExplanation && corr.explanationAr ? (
                      <span className="text-slate-200 font-sans block text-right dir-rtl">
                        💡 {corr.explanationAr}
                      </span>
                    ) : (
                      <span>💡 {corr.explanation}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Native Speaker Phrasing */}
          {nativeAlternative && (
            <div className="rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 p-3 border border-blue-800/30">
              <div className="flex items-center justify-between text-xs font-medium text-blue-300 mb-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {isRtl ? 'كيف يقولها المتحدث الأصلي (Like a Native):' : 'Native Speaker Phrasing:'}
                </span>
                <button
                  onClick={() => playAudio(nativeAlternative)}
                  className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-blue-100 bg-blue-900/40 px-2 py-0.5 rounded transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'استمع' : 'Listen'}</span>
                </button>
              </div>
              <p className="font-serif italic text-slate-200 text-sm pl-1">
                {nativeAlternative}
              </p>
              {nativeAlternativeAr && showArabicExplanation && (
                <p className="text-[11px] text-slate-400 mt-1 text-right dir-rtl">
                  {nativeAlternativeAr}
                </p>
              )}
            </div>
          )}

          {/* Vocabulary Booster */}
          {vocabularyBoost && vocabularyBoost.length > 0 && (
            <div className="rounded-xl bg-purple-950/20 p-3 border border-purple-800/30">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>{isRtl ? 'ثروتك اللغوية (كلمات ذات صلة بالموضوع):' : 'Vocabulary Booster:'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vocabularyBoost.map((item, i) => {
                  const isSaved = savedWords.some(w => w.word.toLowerCase() === item.word.toLowerCase());
                  return (
                    <div key={i} className="flex flex-col justify-between rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-purple-300 text-xs flex items-center gap-1">
                            {item.word}
                            <button
                              onClick={() => playAudio(item.word)}
                              className="text-purple-400 hover:text-purple-200"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </span>
                          <button
                            onClick={() => onSaveWord && onSaveWord(item)}
                            disabled={isSaved}
                            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition ${
                              isSaved
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
                            }`}
                            title={isSaved ? 'محفوظة في سجل الكلمات' : 'حفظ في السجل'}
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span>{isSaved ? (isRtl ? 'محفوظ' : 'Saved') : (isRtl ? 'حفظ' : 'Save')}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          {showArabicExplanation && item.meaningAr ? item.meaningAr : item.meaning}
                        </p>
                      </div>
                      {item.example && (
                        <p className="text-[10px] text-slate-400 italic mt-1.5 border-t border-slate-800/60 pt-1">
                          "{item.example}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pronunciation Tips */}
          {pronunciationTips && pronunciationTips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-medium">🗣️ {isRtl ? 'نصيحة نطق:' : 'Pronunciation:'}</span>
              {pronunciationTips.map((tip, idx) => (
                <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                  <strong className="text-amber-200">{tip.word}:</strong> {tip.tip}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
