import React, { useState } from 'react';
import { X, Award, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, RefreshCw, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    id: 1,
    levelTarget: 'A2-B1',
    promptEn: 'Choose the correct form to complete the sentence:',
    promptAr: 'اختر الصيغة النحوية الصحيحة لإكمال الجملة التالية:',
    sentence: '“If I had known about the schedule change yesterday, I _____ attended the meeting.”',
    options: [
      { text: 'would have', isCorrect: true },
      { text: 'will have', isCorrect: false },
      { text: 'would', isCorrect: false },
      { text: 'had', isCorrect: false }
    ],
    explanation: 'In third conditional sentences (past unreal situations), we use "would have + past participle".'
  },
  {
    id: 2,
    levelTarget: 'B1-B2',
    promptEn: 'Choose the most natural word for this professional context:',
    promptAr: 'اختر الكلمة الأكثر ملاءمة وسياقية في هذا التعبير المهني:',
    sentence: '“The team’s rapid adaptation to the new software had a profound _____ on our productivity.”',
    options: [
      { text: 'impact', isCorrect: true },
      { text: 'affect', isCorrect: false },
      { text: 'reaction', isCorrect: false },
      { text: 'impression', isCorrect: false }
    ],
    explanation: '"Profound impact" is a common native collocation describing a strong, significant effect.'
  },
  {
    id: 3,
    levelTarget: 'B2-C1',
    promptEn: 'Identify the correct idiom to express irreversibly cutting ties:',
    promptAr: 'اختر التعبير الاصطلاحي الصحيح الذي يعني قطع العلاقات بشكل لا رجعة فيه:',
    sentence: '“He was advised to resolve the dispute diplomatically rather than _____ his bridges with the firm.”',
    options: [
      { text: 'burning', isCorrect: true },
      { text: 'crossing', isCorrect: false },
      { text: 'breaking', isCorrect: false },
      { text: 'closing', isCorrect: false }
    ],
    explanation: '"Burning bridges" is an English idiom meaning to destroy relationships or avenues of return.'
  }
];

export default function PlacementTestModal({ isOpen, onClose, currentLevel, onSaveLevel, uiLang = 'ar' }) {
  const isRtl = uiLang === 'ar';
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[currentIdx];

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate result
      let correctCount = 0;
      QUESTIONS.forEach((q, idx) => {
        const chosen = selectedAnswers[idx];
        if (chosen !== undefined && q.options[chosen].isCorrect) {
          correctCount++;
        }
      });

      let calculatedLevel = 'Intermediate';
      if (correctCount === 0) calculatedLevel = 'Beginner';
      else if (correctCount === 1 || correctCount === 2) calculatedLevel = 'Intermediate';
      else if (correctCount === 3) calculatedLevel = 'Advanced';

      onSaveLevel(calculatedLevel);
      setIsSubmitted(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isRtl ? 'اختبار تحديد المستوى الذكي (CEFR)' : 'Quick CEFR Level Placement'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRtl ? `السؤال ${currentIdx + 1} من ${QUESTIONS.length}` : `Question ${currentIdx + 1} of ${QUESTIONS.length}`}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                {currentQ.levelTarget}
              </span>
              <p className="text-xs text-slate-300 mb-3">
                {isRtl ? currentQ.promptAr : currentQ.promptEn}
              </p>
              <div className="text-sm font-semibold text-white bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed font-mono">
                {currentQ.sentence}
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 mb-6">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold text-right rtl:text-right ltr:text-left transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                {isRtl ? 'السابق' : 'Previous'}
              </button>

              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentIdx] === undefined}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-40"
              >
                <span>{currentIdx === QUESTIONS.length - 1 ? (isRtl ? 'عرض النتيجة' : 'See Result') : (isRtl ? 'التالي' : 'Next')}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">
              {isRtl ? 'اكتمل التقييم بنجاح!' : 'Level Assessment Complete!'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              {isRtl ? 'تم تحديد مستواك وضبط سرعة ومفردات الأستاذ الذكي تلقائياً.' : 'Your proficiency level has been determined and the AI tutor is now calibrated.'}
            </p>

            <div className="inline-block rounded-2xl bg-amber-500/10 border border-amber-500/30 px-6 py-3 mb-6">
              <span className="text-[11px] text-amber-400 block font-semibold mb-0.5">
                {isRtl ? 'مستواك المعتمد الجديد:' : 'Your Calibrated Level:'}
              </span>
              <span className="text-2xl font-black text-white tracking-wide">
                {currentLevel}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إعادة الاختبار' : 'Retake Test'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                {isRtl ? 'بدء الممارسة بمستواي الجديد' : 'Start Practice Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
