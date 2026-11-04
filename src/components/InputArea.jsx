import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Sparkles, AlertCircle, HelpCircle, Copy, Check, ExternalLink, Settings, Radio } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function InputArea({
  onSendMessage,
  isLoading,
  settings = {},
  onOpenSettings,
  uiLang = 'ar'
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMediaRecording, setIsMediaRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const textareaRef = useRef(null);
  const timerRef = useRef(null);
  const isRtl = uiLang === 'ar';

  const handleSend = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;
    onSendMessage(textToSend);
    setInput('');
    setInterimText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle Web Speech API
  const toggleVoiceRecording = () => {
    // If already recording via media recorder, stop it
    if (isMediaRecording) {
      stopWhisperRecording();
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setInterimText('');
    } else {
      setSpeechError(null);
      setShowTroubleshoot(false);

      const started = speechService.startListening({
        lang: 'en-US',
        onInterim: (text) => {
          setInterimText(text);
        },
        onResult: (finalText) => {
          setInput((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${separator}${finalText}`;
          });
          setInterimText('');
          // Continuous listening remains ON so the user can speak at their own pace without interruption!
        },
        onError: (err) => {
          setIsListening(false);
          const errCode = err.code || err;
          if (errCode === 'network') {
            setSpeechError({
              type: 'network',
              title: isRtl ? 'تعذر الاتصال بمحرك الصوت (خطأ Network)' : 'Network Error with Speech Engine',
              desc: isRtl
                ? 'يحدث هذا غالباً في متصفح Brave أو بسبب حظر المتصفح لخدمات Google للتعرف الصوتي.'
                : 'Common in Brave browser or when Google speech servers are blocked.'
            });
            setShowTroubleshoot(true);
          } else if (errCode === 'not-allowed') {
            setSpeechError({
              type: 'permission',
              title: isRtl ? 'تم رفض إذن المايكروفون' : 'Microphone Permission Denied',
              desc: isRtl
                ? 'يرجى النقر على أيقونة القفل أو الكاميرا بجانب شريط العنوان والسماح باستخدام المايكروفون.'
                : 'Please allow microphone access in your browser address bar.'
            });
          } else if (errCode === 'exception' || errCode === 'already-running' || errCode === 'aborted') {
            setSpeechError({
              type: 'reset',
              title: isRtl ? 'تمت إعادة ضبط المايكروفون. انقر مجدداً للتحدث.' : 'Microphone reset. Click again to speak.',
              desc: ''
            });
            setTimeout(() => setSpeechError(null), 3000);
          } else {
            setSpeechError({
              type: 'general',
              title: isRtl ? `تنبيه المايكروفون: ${errCode}` : `Microphone alert: ${errCode}`,
              desc: ''
            });
          }
        },
        onEnd: () => {
          setIsListening(false);
          setInterimText('');
        }
      });

      if (started) {
        setIsListening(true);
      }
    }
  };

  // Whisper Audio Recording (Alternative engine using MediaRecorder + Groq Whisper)
  const startWhisperRecording = async () => {
    setSpeechError(null);
    setShowTroubleshoot(false);
    setRecordingSeconds(0);

    const started = await speechService.startMediaRecorder({
      onStart: () => {
        setIsMediaRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      },
      onError: (err) => {
        setIsMediaRecording(false);
        setSpeechError({
          type: 'permission',
          title: isRtl ? 'تعذر تشغيل مسجل الصوت' : 'Failed to access microphone',
          desc: err.message
        });
      }
    });

    if (!started) {
      setIsMediaRecording(false);
    }
  };

  const stopWhisperRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsMediaRecording(false);
    setIsTranscribing(true);

    try {
      const audioBlob = await speechService.stopMediaRecorder();
      if (!audioBlob) {
        setIsTranscribing(false);
        return;
      }

      // If user has groqKey, transcribe with Groq Whisper
      if (settings?.groqKey) {
        const text = await speechService.transcribeWithGroq(audioBlob, settings.groqKey);
        if (text) {
          setInput(prev => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${separator}${text}`;
          });
        }
      } else {
        // Prompt to add Groq Key for Whisper or use Chrome
        setSpeechError({
          type: 'groq-needed',
          title: isRtl ? 'تم تسجيل صوتك بنجاح! لتفريغه بالذكاء الاصطناعي:' : 'Voice recorded! To transcribe with AI:',
          desc: isRtl
            ? 'أضف مفتاح Groq المجاني في الإعدادات لتفعيل تفريغ Whisper الصوتي فائق الدقة، أو افتح الموقع في متصفح Chrome.'
            : 'Add a free Groq API key in Settings to enable Whisper transcription, or use Google Chrome.'
        });
        setShowTroubleshoot(true);
      }
    } catch (e) {
      console.error(e);
      setSpeechError({
        type: 'transcribe_error',
        title: isRtl ? 'خطأ أثناء تفريغ الصوت عبر Whisper' : 'Whisper transcription failed',
        desc: e.message
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyBravePath = () => {
    navigator.clipboard.writeText('brave://settings/privacy');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const quickPrompts = [
    { label: "Give me an example", labelAr: "أعطني مثالاً عملياً" },
    { label: "How to say this more politely?", labelAr: "كيف أصيغها بلباقة أعلى؟" },
    { label: "Explain the grammar rule", labelAr: "اشرح لي القاعدة بالتفصيل" },
  ];

  return (
    <div className="border-t border-slate-800 bg-slate-950/90 p-3 sm:p-4 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl space-y-2">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar" dir={isRtl ? 'rtl' : 'ltr'}>
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {isRtl ? 'ردود سريعة:' : 'Quick shortcuts:'}
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(q.label)}
              disabled={isLoading}
              className="rounded-full bg-slate-900 border border-slate-800/80 px-2.5 py-1 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800 transition whitespace-nowrap text-[11px]"
            >
              {isRtl ? q.labelAr : q.label}
            </button>
          ))}
        </div>

        {/* Live speech feedback if recording */}
        {isListening && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-950/60 to-indigo-950/60 border border-rose-500/50 px-3.5 py-2.5 text-xs text-rose-200 shadow-lg backdrop-blur-md animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-white shrink-0">
                  {isRtl ? '🎙️ يستمع إليك باستمرار دون انقطاع:' : '🎙️ Continuous Listening:'}
                </span>
                <span className="text-[11px] text-rose-300">
                  {isRtl ? 'تحدث وخذ وقتك للتفكير بحرية، لن يتوقف حتى تضغط إيقاف أو إرسال.' : 'Speak and take your time, it won\'t stop until you finish.'}
                </span>
              </div>
              {interimText && (
                <span className="italic text-emerald-300 truncate max-w-[200px] font-mono text-[11px] ml-1" dir="ltr">
                  "{interimText}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleVoiceRecording}
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-md transition"
              >
                {isRtl ? '✓ انتهيت من الكلام' : '✓ Done'}
              </button>
            </div>
          </div>
        )}

        {/* MediaRecorder Audio Recording View */}
        {isMediaRecording && (
          <div className="flex items-center justify-between rounded-xl bg-indigo-500/15 border border-indigo-500/40 px-3 py-2 text-xs text-indigo-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="font-semibold">
                {isRtl ? 'تسجيل صوتي مباشر (Whisper):' : 'Recording audio for Whisper:'}
              </span>
              <span className="font-mono text-white font-bold">{recordingSeconds}s</span>
            </div>
            <button
              onClick={stopWhisperRecording}
              className="text-[11px] bg-indigo-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-indigo-500 shadow"
            >
              {isRtl ? 'إيقاف وتفريغ الصوت ➔' : 'Stop & Transcribe ➔'}
            </button>
          </div>
        )}

        {/* Transcribing state */}
        {isTranscribing && (
          <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-3 py-2 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span>{isRtl ? 'جاري تفريغ الصوت وتحويله إلى نص عبر الذكاء الاصطناعي...' : 'Transcribing voice via AI Whisper...'}</span>
          </div>
        )}

        {/* Detailed Speech Error & Troubleshooting Box */}
        {speechError && (
          <div className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-3 text-xs text-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{speechError.title}</span>
              </div>
              <button
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="text-[11px] text-indigo-300 hover:text-white underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showTroubleshoot ? (isRtl ? 'إخفاء الحلول' : 'Hide') : (isRtl ? 'كيف أحل المشكلة؟' : 'How to fix?')}</span>
              </button>
            </div>

            {speechError.desc && (
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {speechError.desc}
              </p>
            )}

            {/* Troubleshooting Solutions Panel */}
            {showTroubleshoot && (
              <div className="mt-2 pt-2 border-t border-amber-800/40 space-y-2 text-[11px]">
                <p className="font-bold text-white">
                  {isRtl ? '3 طرق بسيطة لتشغيل المايكروفون فوراً:' : '3 Simple Ways to Fix Microphone:'}
                </p>

                {/* Option 1: Chrome / Edge */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    1️⃣ {isRtl ? 'الحل الأسرع والأسهل (في ثانيتين):' : 'Fastest Solution:'}
                  </span>
                  <p className="text-slate-300">
                    {isRtl
                      ? 'افتح الرابط في متصفح Google Chrome أو Microsoft Edge وسيعمل المايكروفون بنقرة واحدة بدون أي إعدادات.'
                      : 'Open http://localhost:5173 in Google Chrome or Microsoft Edge and the mic will work instantly.'}
                  </p>
                </div>

                {/* Option 2: Brave Fix */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <span className="font-semibold text-blue-400 block mb-0.5">
                    2️⃣ {isRtl ? 'إذا كنت تستخدم متصفح Brave:' : 'If you are using Brave Browser:'}
                  </span>
                  <p className="text-slate-300 mb-1.5">
                    {isRtl
                      ? 'متصفح Brave يحظر خدمات التعرف الصوتي تلقائياً. لتفعيلها:'
                      : 'Brave disables Google speech recognition by default. To enable:'}
                  </p>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 font-mono text-[10px]">
                    <span className="text-indigo-300 flex-1 truncate">brave://settings/privacy</span>
                    <button
                      onClick={copyBravePath}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-white"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                    </button>
                  </div>
                  <p className="text-slate-400 mt-1 text-[10px]">
                    {isRtl
                      ? 'ألصق الرابط في شريط العنوان ثم فعّل: "Use Google services for speech recognition".'
                      : 'Paste in address bar, then enable "Use Google services for speech recognition".'}
                  </p>
                </div>

                {/* Option 3: Use Whisper */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-400">
                      3️⃣ {isRtl ? 'تسجيل صوتي مباشر مع Whisper (يعمل في أي متصفح!):' : 'Direct Audio Recording with Whisper:'}
                    </span>
                    {onOpenSettings && (
                      <button
                        onClick={onOpenSettings}
                        className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800 flex items-center gap-1 hover:bg-purple-900/70"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{isRtl ? 'إعدادات المفاتيح' : 'Settings'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1">
                    {isRtl
                      ? 'يمكنك التسجيل الصوتي المباشر دون الاعتماد على محرك المتصفح. (فقط أضف مفتاح Groq المجاني لتفريغ النص بدقة الذكاء الاصطناعي).'
                      : 'Records audio via standard HTML5 without depending on closed browser engines.'}
                  </p>
                  <button
                    onClick={startWhisperRecording}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ابدأ التسجيل الصوتي المباشر الآن' : 'Start Direct Audio Recording'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Input Box */}
        <div className="flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition shadow-inner">
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white animate-recording shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isListening ? 'Stop Recording' : 'Start Voice Input (STT)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* Textarea with dir="auto" to naturally align English and Arabic */}
          <textarea
            ref={textareaRef}
            rows={1}
            dir="auto"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isRtl
                ? 'اكتب رسالتك بالإنجليزية أو اضغط المايكروفون للتحدث...'
                : 'Type your message in English or click the mic to speak...'
            }
            className="flex-1 max-h-28 resize-none bg-transparent py-2 px-2 text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed text-left font-sans"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              input.trim() && !isLoading
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-500">
          {isRtl
            ? 'تحدث بأريحية وبدون قلق من الأخطاء — الذكاء الاصطناعي هنا ليرشدك ويصحح لك بلطف 🎓'
            : 'Speak freely and without fear of mistakes — AI is here to guide and correct you gently 🎓'}
        </p>
      </div>
    </div>
  );
}
