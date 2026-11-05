import React, { useState } from 'react';
import { X, FileText, Copy, Download, Printer, Check, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

export default function LessonSummaryModal({
  isOpen,
  onClose,
  messages = [],
  activePersona,
  activeTopic,
  savedWords = [],
  uiLang = 'ar'
}) {
  const isRtl = uiLang === 'ar';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract all corrections made during the conversation
  const corrections = [];
  let totalFluency = 0;
  let fluencyCount = 0;

  messages.forEach(msg => {
    if (msg.role === 'user' && msg.feedback) {
      if (Array.isArray(msg.feedback.corrections)) {
        msg.feedback.corrections.forEach(c => corrections.push(c));
      }
      if (typeof msg.feedback.fluencyScore === 'number') {
        totalFluency += msg.feedback.fluencyScore;
        fluencyCount++;
      }
    }
  });

  const avgFluency = fluencyCount > 0 ? Math.round(totalFluency / fluencyCount) : 88;

  // Generate plain-text study summary
  const generateSummaryText = () => {
    let text = `======================================\n`;
    text += ` FLUENTLY AI - STUDY SUMMARY & NOTES  \n`;
    text += `======================================\n`;
    text += `Topic: ${activeTopic.title} (${activeTopic.titleAr || ''})\n`;
    text += `Tutor: ${activePersona.name} (${activePersona.role})\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;
    text += `Fluency Rating: ${avgFluency}%\n\n`;

    text += `--- GRAMMAR & PHRASING CORRECTIONS ---\n`;
    if (corrections.length === 0) {
      text += `No major grammar mistakes detected! Excellent work!\n\n`;
    } else {
      corrections.forEach((c, i) => {
        text += `${i + 1}. Original: "${c.original}"\n`;
        text += `   Corrected: "${c.corrected}"\n`;
        text += `   Rule: ${c.explanation}\n`;
        if (c.explanationAr) text += `   الشرح: ${c.explanationAr}\n`;
        text += `\n`;
      });
    }

    text += `--- VOCABULARY VAULT ITEMS ---\n`;
    if (savedWords.length === 0) {
      text += `No words explicitly saved yet.\n\n`;
    } else {
      savedWords.slice(0, 10).forEach((w, i) => {
        text += `${i + 1}. ${w.word} (${w.meaningAr || w.meaning || ''})\n`;
        if (w.example) text += `   Example: "${w.example}"\n`;
      });
    }

    text += `\n======================================\n`;
    text += `Keep practicing daily with Fluently AI!\n`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const text = generateSummaryText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fluently-Lesson-${activeTopic.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border border-indigo-500/30 bg-slate-900/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isRtl ? 'ملخص ومذكرة الدرس' : 'Lesson Study Sheet'}
              </h3>
              <p className="text-xs text-slate-400">
                {activePersona.name} &bull; {isRtl ? activeTopic.titleAr : activeTopic.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Top Banner Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">{isRtl ? 'مستوى الطلاقة' : 'Fluency Rating'}</span>
              <span className="text-base font-black text-emerald-400">🎯 {avgFluency}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">{isRtl ? 'الأخطاء المصححة' : 'Corrections'}</span>
              <span className="text-base font-black text-rose-400">📝 {corrections.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">{isRtl ? 'الكلمات المحفوظة' : 'Saved Words'}</span>
              <span className="text-base font-black text-purple-400">📚 {savedWords.length}</span>
            </div>
          </div>

          {/* Grammar Corrections Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{isRtl ? 'الملاحظات والتصحيحات النحوية في هذه الجلسة:' : 'Grammar Corrections in this Session:'}</span>
            </h4>

            {corrections.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                {isRtl ? '🎉 لم يتم تسجيل أي أخطاء لغوية حرجة! لغتك ممتازة.' : '🎉 No grammar mistakes recorded! Outstanding performance.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {corrections.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-rose-400 font-mono">{c.original}</span>
                      <span className="text-slate-500">➜</span>
                      <span className="text-emerald-400 font-bold font-mono">{c.corrected}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{c.explanation}</p>
                    {c.explanationAr && (
                      <p className="text-[11px] text-indigo-300 font-sans">{c.explanationAr}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Vocabulary Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{isRtl ? 'المفردات والتعابير المفيدة:' : 'Vocabulary Highlights:'}</span>
            </h4>

            {savedWords.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                {isRtl ? 'لم تقم بحفظ أي مفردات حتى الآن. انقر على أيقونة الإشارة المرجعية لأي كلمة لحفظها!' : 'No words saved yet. Click bookmark on any vocabulary item to save it!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {savedWords.slice(0, 8).map((w, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="font-bold text-purple-300 text-xs block">{w.word}</span>
                    <span className="text-[11px] text-slate-400 block">{w.meaningAr || w.meaning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/40 rounded-b-3xl">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{isRtl ? 'طباعة' : 'Print'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الملخص' : 'Copy')}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تحميل كملف نصي' : 'Download TXT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
