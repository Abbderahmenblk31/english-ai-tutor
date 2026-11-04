import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, User, RefreshCw, AlertCircle, Headphones, Key, ExternalLink, CheckCircle2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import CorrectionCard from './CorrectionCard';
import { testGeminiKey } from '../services/aiService';

export default function ChatWindow({
  messages,
  isLoading,
  activePersona,
  activeTopic,
  onPlaySpeech,
  onStopSpeech,
  speakingMessageId,
  autoSpeak,
  onToggleAutoSpeak,
  onSaveWord,
  savedWords,
  accent,
  uiLang = 'ar',
  onSelectPrompt,
  settings = {},
  onUpdateSettings,
  onResetChat,
}) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isRtl = uiLang === 'ar';

  const [quickKey, setQuickKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyError, setKeyError] = useState(null);
  const [keySuccess, setKeySuccess] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollTop(scrollTop > 180);
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const hasActiveKey = Boolean(
    (settings?.provider === 'gemini' && settings?.geminiKey?.trim()) ||
    (settings?.provider === 'groq' && settings?.groqKey?.trim()) ||
    (settings?.provider === 'openai' && settings?.openaiKey?.trim()) ||
    settings?.provider === 'ollama'
  );

  const handleActivateKey = async () => {
    if (!quickKey.trim()) return;
    setIsTestingKey(true);
    setKeyError(null);

    try {
      const res = await testGeminiKey(quickKey.trim());
      const selectedModel = res.workingModel || 'gemini-3.1-pro-preview';
      setKeySuccess(`✅ تم تفعيل الذكاء الاصطناعي بنجاح عبر نموذج Google (${selectedModel})!`);
      if (onUpdateSettings) {
        onUpdateSettings({
          provider: 'gemini',
          geminiKey: quickKey.trim(),
          geminiModel: selectedModel
        });
      }
      setTimeout(() => {
        setKeySuccess(null);
      }, 4000);
    } catch (err) {
      setKeyError(err.message || 'المفتاح غير صالح أو لم يتمكن من الاتصال بـ Google');
    } finally {
      setIsTestingKey(false);
    }
  };

  const starterSuggestions = [
    { text: "Hello! I'd like to practice my conversational English today.", textAr: "مرحباً! أود ممارسة المحادثة باللغة الإنجليزية اليوم." },
    { text: "Can you ask me a question about today's topic?", textAr: "هل يمكنك سؤالي سؤالاً حول موضوع اليوم؟" },
    { text: "Could you tell me how to introduce myself naturally in English?", textAr: "كيف أعرّف عن نفسي بأسلوب طبيعي بالإنجليزية؟" },
  ];

  return (
    <div ref={chatContainerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
      {/* ⚠️ Prominent API Key Activation Banner when no key is set */}
      {!hasActiveKey && (
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Key className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {isRtl ? 'تفعيل الذكاء الاصطناعي الحقيقي (Google Gemini)' : 'Activate Real AI English Tutor'}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    {isRtl ? 'مجاني 100%' : '100% Free'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isRtl
                    ? 'لكي يتحدث معك الأستاذ بذكاء حقيقي متجدد ويصحح لغتك دون تكرار أي رد، احصل على مفتاحك المجاني من Google وضعه هنا في ثوانٍ:'
                    : 'To chat dynamically with genuine generative AI without canned repetitions, connect your free Gemini API key:'}
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition shrink-0 self-stretch sm:self-auto text-center justify-center"
            >
              <span>{isRtl ? '1. انسخ المفتاح مجاناً' : '1. Get Free Key'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="password"
              placeholder={isRtl ? '2. الصق المفتاح هنا (يبدأ بـ AIzaSy...)' : '2. Paste key here (AIzaSy...)'}
              value={quickKey}
              onChange={(e) => setQuickKey(e.target.value)}
              className="w-full flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={handleActivateKey}
              disabled={isTestingKey || !quickKey.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              {isTestingKey ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isTestingKey ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'تفعيل وبدء المحادثة فوراً' : 'Activate Now')}</span>
            </button>
          </div>

          {keyError && (
            <p className="text-xs text-rose-400 mt-2 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              ❌ {keyError}
            </p>
          )}

          {keySuccess && (
            <p className="text-xs text-emerald-400 mt-2 font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{keySuccess}</span>
            </p>
          )}
        </div>
      )}

      {/* Topic Objective Banner with Voice Profile & Controls */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm">
                  {activePersona.name} &bull; {isRtl ? activeTopic.titleAr : activeTopic.title}
                </h3>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30" dir="ltr">
                  {activePersona.accent === 'en-GB' ? '🇬🇧 British Accent' : '🇺🇸 American Accent'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5" dir={isRtl ? 'rtl' : 'ltr'}>
                {activeTopic.objective}
              </p>
              {activePersona.voiceConfig?.vocalTone && (
                <p className="text-[11px] text-indigo-300/90 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="text-indigo-400">🎙️</span>
                  <span>{activePersona.voiceConfig.vocalTone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Test Persona Voice Button */}
            <button
              onClick={() => {
                const samplePhrase = `Hello! I am ${activePersona.name}. This is my distinct voice for our English sessions. Let's speak fluently!`;
                if (speakingMessageId === 'voice_test') {
                  onStopSpeech();
                } else {
                  onPlaySpeech('voice_test', samplePhrase, activePersona);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm ${
                speakingMessageId === 'voice_test'
                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border-indigo-500/30 hover:text-white'
              }`}
              title="انقر لتجربة نبرة وصوت هذا الأستاذ الفريدة"
            >
              {speakingMessageId === 'voice_test' ? <VolumeX className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
              <span>
                {speakingMessageId === 'voice_test'
                  ? (isRtl ? 'إيقاف التجربة' : 'Stop')
                  : (isRtl ? '🎧 جرّب نبرة الصوت' : 'Test Voice')}
              </span>
            </button>

            {/* Auto-Speak Toggle */}
            <button
              onClick={onToggleAutoSpeak}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                autoSpeak
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={
                autoSpeak
                  ? (isRtl ? 'قراءة الردود تلقائياً مفعّلة (انقر لكتمها)' : 'Auto-speak enabled (click to mute)')
                  : (isRtl ? 'قراءة الردود تلقائياً مكتومة (انقر لتفعيلها)' : 'Auto-speak muted (click to enable)')
              }
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline text-[11px]">
                {autoSpeak ? (isRtl ? 'قراءة تلقائية' : 'Auto-Read: On') : (isRtl ? 'قراءة يدوية' : 'Manual')}
              </span>
            </button>

            {/* Clear Conversation Button */}
            <button
              onClick={onResetChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition shadow-sm"
              title={isRtl ? 'فسخ المحادثة والبدء من جديد' : 'Clear chat and start fresh'}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px]">{isRtl ? 'فسخ المحادثة' : 'Clear Chat'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Speaking Controller Bar */}
      {speakingMessageId && (
        <div className="sticky top-2 z-20 mx-auto max-w-md flex items-center justify-between gap-3 rounded-2xl bg-indigo-950/95 border border-indigo-500/50 p-2.5 px-4 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-7 h-7 rounded-full object-cover border border-indigo-400 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {activePersona.name} {isRtl ? 'يتحدث بصوته الآن...' : 'is speaking...'}
              </span>
              <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                <span className="w-1.5 h-3 bg-indigo-400 rounded-full wave-bar-1" />
                <span className="w-1.5 h-4 bg-indigo-400 rounded-full wave-bar-2" />
                <span className="w-1.5 h-2.5 bg-indigo-400 rounded-full wave-bar-3" />
                <span className="truncate">{activePersona.voiceConfig?.vocalTone}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onStopSpeech}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition shrink-0"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إيقاف الصوت' : 'Stop'}</span>
          </button>
        </div>
      )}

      {/* Messages List */}
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCurrentlySpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div className={`flex items-start gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isUser ? (
                  <img
                    src={activePersona.avatar}
                    alt={activePersona.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1 shadow"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow">
                    <User className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-left font-sans leading-relaxed" dir="ltr">
                      {msg.content}
                    </p>

                    {/* Audio Playback button for AI response */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
                        <button
                          onClick={() => {
                            if (isCurrentlySpeaking) {
                              onStopSpeech();
                            } else {
                              onPlaySpeech(msg.id, msg.content, activePersona);
                            }
                          }}
                          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition ${
                            isCurrentlySpeaking
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                          }`}
                        >
                          {isCurrentlySpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'إيقاف الصوت' : 'Stop'}</span>
                              <span className="flex items-center gap-0.5 ml-1">
                                <span className="w-1 h-3 bg-rose-400 rounded-full wave-bar-1" />
                                <span className="w-1 h-4 bg-rose-400 rounded-full wave-bar-2" />
                                <span className="w-1 h-2 bg-rose-400 rounded-full wave-bar-3" />
                              </span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{isRtl ? `استمع لصوت ${activePersona.name}` : 'Listen'}</span>
                            </>
                          )}
                        </button>

                        <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* If user message has AI grammar & phrasing feedback */}
                  {isUser && msg.feedback && (
                    <CorrectionCard
                      feedback={msg.feedback}
                      persona={activePersona}
                      onSaveWord={onSaveWord}
                      savedWords={savedWords}
                      accent={accent}
                      uiLang={uiLang}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1 animate-pulse"
            />
            <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 px-4 py-3 shadow-md">
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {activePersona.name} {isRtl ? 'يستمع ويحلل الجملة نحويًا...' : 'is analyzing grammar and formulating reply...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Empty state suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="pt-4">
            <p className="text-xs text-slate-400 mb-2 font-medium">
              💡 {isRtl ? 'اقتراحات لبدء المحادثة بنقرة واحدة:' : 'Starter suggestions:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {starterSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(s.text)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-left hover:border-indigo-500/50 hover:bg-slate-800/70 transition group text-xs flex flex-col justify-between"
                >
                  <p className="text-slate-200 group-hover:text-indigo-300 font-medium text-left font-sans" dir="ltr">
                    "{s.text}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 text-right w-full" dir="rtl">
                    {isRtl ? s.textAr : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Controls: Scroll to Top / Bottom */}
      <div className="fixed bottom-28 right-6 md:right-10 z-30 flex flex-col items-center gap-2 pointer-events-auto">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/95 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-600 hover:text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group animate-in fade-in slide-in-from-bottom-2"
            title={isRtl ? 'الصعود لأعلى المحادثة' : 'Scroll to top'}
          >
            <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-xs font-bold">{isRtl ? 'للأعلى' : 'Top'}</span>
          </button>
        )}

        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/95 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group animate-in fade-in slide-in-from-bottom-2"
            title={isRtl ? 'النزول لأسفل المحادثة' : 'Scroll to bottom'}
          >
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            <span className="text-xs font-bold">{isRtl ? 'للأسفل' : 'Bottom'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
