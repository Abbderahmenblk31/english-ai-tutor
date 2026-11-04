import React, { useState } from 'react';
import { X, BookMarked, Volume2, Trash2, Search, Sparkles, Layers, RotateCw } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function VocabularyModal({
  isOpen,
  onClose,
  savedWords = [],
  onRemoveWord,
  onAddWord,
  accent = 'en-US',
  uiLang = 'ar'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const isRtl = uiLang === 'ar';

  const playAudio = (text) => {
    speechService.speak(text, { accent });
  };

  const filteredWords = savedWords.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.meaning && item.meaning.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.meaningAr && item.meaningAr.includes(searchTerm))
  );

  const sampleStarters = [
    {
      word: "hit the nail on the head",
      meaning: "Describe exactly what is causing a situation or problem; be precisely right.",
      meaningAr: "أصبت كبد الحقيقة / وصفت الأمر بدقة متناهية",
      example: "You hit the nail on the head when you mentioned time management."
    },
    {
      word: "touch base",
      meaning: "Briefly make or renew contact with someone.",
      meaningAr: "يتواصل بإيجاز لتحديث المعلومات والمستجدات",
      example: "Let's touch base next Monday to review the progress."
    },
    {
      word: "bite the bullet",
      meaning: "Decide to do something difficult or unpleasant that has been avoided.",
      meaningAr: "يقدم على خطوة صعبة بشجاعة بعد طول تردد",
      example: "I decided to bite the bullet and practice English speaking every day."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isRtl ? 'سجل المفردات والعبارات (Vocabulary Vault)' : 'Vocabulary Vault'}</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                  {savedWords.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl ? 'راجع وتدرب على الكلمات والمصطلحات التي جمعتها من محادثاتك' : 'Review and master vocabulary captured during your practice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedWords.length > 0 && (
              <button
                onClick={() => {
                  setFlashcardMode(!flashcardMode);
                  setIsFlipped(false);
                  setCurrentCardIndex(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  flashcardMode
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{flashcardMode ? (isRtl ? 'عرض القائمة' : 'List Mode') : (isRtl ? 'تمرين البطاقات' : 'Flashcards')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Flashcard Quiz View */}
          {flashcardMode && savedWords.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-xs text-slate-400 mb-3">
                {isRtl ? `البطاقة ${currentCardIndex + 1} من ${savedWords.length}` : `Card ${currentCardIndex + 1} of ${savedWords.length}`}
              </p>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md min-h-[220px] rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-purple-950/40 border-2 border-purple-500/30 p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-xl transition-all hover:scale-[1.01]"
              >
                <div className="w-full flex justify-between items-center text-xs text-slate-500">
                  <span>{isFlipped ? (isRtl ? 'المعنى والتفاصيل' : 'Meaning & Context') : (isRtl ? 'الكلمة' : 'Word')}</span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <RotateCw className="w-3 h-3" /> {isRtl ? 'انقر للقلب' : 'Click to flip'}
                  </span>
                </div>

                {!isFlipped ? (
                  <div className="my-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {savedWords[currentCardIndex]?.word}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(savedWords[currentCardIndex]?.word);
                      }}
                      className="p-2 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 inline-flex transition"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="my-auto space-y-2">
                    <p className="text-base font-semibold text-purple-300">
                      {savedWords[currentCardIndex]?.meaningAr || savedWords[currentCardIndex]?.meaning}
                    </p>
                    <p className="text-xs text-slate-400">
                      {savedWords[currentCardIndex]?.meaning}
                    </p>
                    {savedWords[currentCardIndex]?.example && (
                      <p className="text-xs text-slate-300 italic border-t border-slate-800 pt-2">
                        "{savedWords[currentCardIndex]?.example}"
                      </p>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-500">
                  {isRtl ? 'انقر على البطاقة لإظهار / إخفاء المعنى' : 'Tap to reveal meaning'}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
                >
                  {isRtl ? 'السابق' : 'Previous'}
                </button>
                <button
                  disabled={currentCardIndex === savedWords.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.min(savedWords.length - 1, prev + 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-semibold text-white disabled:opacity-40 hover:bg-purple-500"
                >
                  {isRtl ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          ) : (
            /* List Mode */
            <div className="space-y-4">
              {/* Search Bar */}
              {savedWords.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isRtl ? 'بحث في الكلمات المحفوظة...' : 'Search saved words...'}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Words Cards */}
              {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredWords.map((item) => (
                    <div
                      key={item.id || item.word}
                      className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3 flex flex-col justify-between hover:border-purple-500/40 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                            {item.word}
                            <button
                              onClick={() => playAudio(item.word)}
                              className="text-purple-400 hover:text-purple-200 transition"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </span>

                          <button
                            onClick={() => onRemoveWord(item.id)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 font-medium">
                          {item.meaningAr || item.meaning}
                        </p>
                        {item.meaningAr && item.meaning && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.meaning}
                          </p>
                        )}
                      </div>

                      {item.example && (
                        <p className="text-[10px] text-slate-400 italic mt-2 border-t border-slate-800/60 pt-1.5">
                          "{item.example}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state: offer sample idioms to get started */
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {isRtl ? 'سجل المفردات فارغ حالياً' : 'Your Vocabulary Vault is Empty'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {isRtl
                      ? 'أثناء تحدثك مع الأستاذ، انقر على زر (حفظ) بجانب أي كلمة جديدة أو مصطلح لتخزينه هنا.'
                      : 'While chatting with your AI tutor, click "Save" on any suggested vocabulary or native idiom to keep it here.'}
                  </p>

                  <div className="mt-5 border-t border-slate-800 pt-4 text-left">
                    <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {isRtl ? 'أو أضف هذه المصطلحات الشائعة فوراً لتجربة السجل:' : 'Or add these essential idioms to start now:'}
                    </p>
                    <div className="space-y-2">
                      {sampleStarters.map((starter, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-2.5"
                        >
                          <div>
                            <span className="font-semibold text-xs text-purple-300 block">{starter.word}</span>
                            <span className="text-[11px] text-slate-400">{starter.meaningAr}</span>
                          </div>
                          <button
                            onClick={() => onAddWord(starter)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-500 transition"
                          >
                            {isRtl ? 'إضافة' : 'Add'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
