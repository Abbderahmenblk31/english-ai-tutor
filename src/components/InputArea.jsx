import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, AlertCircle, HelpCircle, Copy, Check, ExternalLink, Settings, Radio, Smartphone } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function InputArea({
  onSendMessage,
  isLoading,
  settings = {},
  onOpenSettings,
  uiLang = 'ar',
  prefillValue = '',
  onClearPrefill
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

  useEffect(() => {
    if (prefillValue) {
      setInput(prefillValue);
      if (onClearPrefill) onClearPrefill();
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [prefillValue]);

  const handleSend = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    if (isMediaRecording) {
      stopAudioCaptureRecording();
      return;
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

  // HTML5 MediaRecorder Audio Capture (Works on ALL phones, iOS Safari, Android, and WebViews)
  const startAudioCaptureRecording = async () => {
    setSpeechError(null);
    setShowTroubleshoot(false);
    setRecordingSeconds(0);

    const started = await speechService.startMediaRecorder({
      onStart: () => {
        setIsMediaRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      },
      onError: (err) => {
        setIsMediaRecording(false);
        const isNotAllowed = err.name === 'NotAllowedError' || err.message?.includes('Permission');
        setSpeechError({
          type: 'permission',
          title: isNotAllowed 
            ? (isRtl ? 'تم رفض إذن المايكروفون على هاتفك' : 'Microphone Permission Denied')
            : (isRtl ? 'تعذر تشغيل المايكروفون على الهاتف' : 'Failed to access microphone'),
          desc: isRtl
            ? 'تأكد من السماح بالمايك في المتصفح أو إعدادات تطبيق الهاتف، وتأكد من فتح الرابط عبر رابط مشفر (HTTPS).'
            : 'Please grant microphone permission in your phone browser/app settings and ensure HTTPS is used.'
        });
        setShowTroubleshoot(true);
      }
    });

    if (!started) {
      setIsMediaRecording(false);
    }
  };

  const stopAudioCaptureRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsMediaRecording(false);
    setIsTranscribing(true);

    try {
      const audioBlob = await speechService.stopMediaRecorder();
      if (!audioBlob) {
        setIsTranscribing(false);
        return;
      }

      // Check available transcription engine:
      // 1. Google Gemini (direct audio multimodal STT)
      // 2. Groq Whisper
      let transcribedText = '';

      if (settings?.geminiKey && settings.geminiKey.trim()) {
        transcribedText = await speechService.transcribeWithGemini(audioBlob, settings.geminiKey);
      } else if (settings?.groqKey && settings.groqKey.trim()) {
        transcribedText = await speechService.transcribeWithGroq(audioBlob, settings.groqKey);
      } else {
        // Prompt user to add Gemini or Groq key to enable AI transcription
        setSpeechError({
          type: 'key-needed',
          title: isRtl ? 'تم تسجيل صوتك بنجاح! لتفريغه بالذكاء الاصطناعي:' : 'Voice recorded! To transcribe with AI:',
          desc: isRtl
            ? 'يرجى وضع مفتاح Google Gemini في الإعدادات ليقوم الذكاء الاصطناعي بتحويل صوتك إلى نص فوراً.'
            : 'Please enter your Google Gemini API key in Settings to transcribe speech on mobile.'
        });
        setShowTroubleshoot(true);
        setIsTranscribing(false);
        return;
      }

      if (transcribedText) {
        setInput((prev) => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return `${prev}${separator}${transcribedText}`;
        });
      }
    } catch (e) {
      console.error('Audio capture transcription error:', e);
      setSpeechError({
        type: 'transcribe_error',
        title: isRtl ? 'تعذر تفريغ الصوت المسجل' : 'Transcription failed',
        desc: e.message || (isRtl ? 'تأكد من صلاحية مفتاح الـ API واتصال الإنترنت' : 'Check your API key and connection')
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Main Voice Toggle (Adaptive for Desktop, Mobile Chrome, and Android WebViews)
  const toggleVoiceRecording = () => {
    // If currently recording audio via MediaRecorder, stop and transcribe
    if (isMediaRecording) {
      stopAudioCaptureRecording();
      return;
    }

    // If currently listening via SpeechRecognition, stop
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setInterimText('');
      return;
    }

    setSpeechError(null);
    setShowTroubleshoot(false);

    // If on a device without Web Speech API (e.g. Android WebView / AppsGeyser / Safari)
    if (!speechService.hasSpeechRecognition()) {
      console.log('Web Speech API unavailable on this device. Auto-launching MediaRecorder...');
      startAudioCaptureRecording();
      return;
    }

    // Attempt Web Speech Recognition with auto-fallback
    const started = speechService.startListening({
      lang: 'en-US',
      onInterim: (text) => setInterimText(text),
      onResult: (finalText) => {
        setInput((prev) => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return `${prev}${separator}${finalText}`;
        });
        setInterimText('');
      },
      onError: (err) => {
        setIsListening(false);
        const errCode = err.code || err;
        console.warn('SpeechRecognition reported error:', errCode);

        // If Web Speech API fails with not-supported or network error on mobile, seamlessly switch to MediaRecorder!
        if (errCode === 'not-supported' || errCode === 'network' || errCode === 'service-not-allowed') {
          console.log('Switching to mobile-friendly MediaRecorder...');
          startAudioCaptureRecording();
          return;
        }

        if (errCode === 'not-allowed') {
          setSpeechError({
            type: 'permission',
            title: isRtl ? 'تم رفض إذن المايكروفون' : 'Microphone Permission Denied',
            desc: isRtl
              ? 'يرجى النقر على أيقونة القفل أو الكاميرا بجانب شريط العنوان والسماح باستخدام المايكروفون.'
              : 'Please allow microphone access in your browser or phone settings.'
          });
          setShowTroubleshoot(true);
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
    } else {
      // Fallback directly to MediaRecorder
      startAudioCaptureRecording();
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
    <div className="border-t border-slate-800/80 bg-slate-950/80 p-3 sm:p-4 backdrop-blur-xl shrink-0">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Quick Prompts Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{isRtl ? 'اقتراحات سريعة:' : 'Quick Prompts:'}</span>
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(p.label)}
              disabled={isLoading}
              className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white transition whitespace-nowrap text-[11px] shrink-0 active:scale-95 disabled:opacity-50"
            >
              {isRtl ? p.labelAr : p.label}
            </button>
          ))}
        </div>

        {/* Live Speech Recognition Feedback (Web Speech API) */}
        {isListening && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/50 px-3.5 py-2.5 text-xs text-indigo-200 animate-in fade-in shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs truncate">
                  {isRtl ? '🎙️ يستمع إليك الآن... خذ وقتك وتحدث بحرية بالإنجليزية' : '🎙️ Listening... speak freely in English'}
                </p>
                {interimText && (
                  <p className="text-[11px] text-indigo-300 italic truncate font-sans" dir="ltr">
                    "{interimText}"
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={toggleVoiceRecording}
              className="text-[11px] bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold shadow-md transition shrink-0"
            >
              {isRtl ? 'إنهاء الكلام' : 'Finish'}
            </button>
          </div>
        )}

        {/* MediaRecorder Active Recording (Universal Mobile / WebView) */}
        {isMediaRecording && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-purple-950/90 border border-rose-500/50 px-3.5 py-2.5 text-xs text-rose-200 animate-in fade-in shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
              </span>
              <div>
                <span className="font-bold text-white block">
                  {isRtl ? '🎙️ مسجل الهاتف يستمع إليك الآن...' : '🎙️ Mobile Audio Recorder Active...'}
                </span>
                <span className="text-[11px] text-rose-300 font-mono">
                  ⏱️ {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')} &bull; {isRtl ? 'انقر للإيقاف والتحويل لنص' : 'Click to stop & transcribe'}
                </span>
              </div>
            </div>
            <button
              onClick={stopAudioCaptureRecording}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-lg transition active:scale-95"
            >
              {isRtl ? 'إيقاف وإرسال ➔' : 'Done ➔'}
            </button>
          </div>
        )}

        {/* Transcribing state */}
        {isTranscribing && (
          <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-3.5 py-2 text-xs text-purple-300 animate-in fade-in">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span className="font-bold">
              {isRtl ? '⚡ جاري تفريغ صوتك وتحويله إلى نص بالذكاء الاصطناعي...' : '⚡ Transcribing your voice via AI...'}
            </span>
          </div>
        )}

        {/* Detailed Speech Error & Troubleshooting Box */}
        {speechError && (
          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-3 text-xs text-amber-200 space-y-2 animate-in fade-in">
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
                <span>{showTroubleshoot ? (isRtl ? 'إخفاء الإرشادات' : 'Hide') : (isRtl ? 'حل مشكلة الهاتف' : 'How to fix?')}</span>
              </button>
            </div>

            {speechError.desc && (
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {speechError.desc}
              </p>
            )}

            {/* Troubleshooting Solutions Panel */}
            {showTroubleshoot && (
              <div className="mt-2 pt-2 border-t border-amber-800/40 space-y-2.5 text-[11px]">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? 'خطوات تشغيل المايكروفون على الهاتف الذكي والأندرويد:' : 'How to enable microphone on mobile:'}</span>
                </p>

                {/* Step 1: HTTPS */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    1️⃣ {isRtl ? 'التأكد من الرابط الآمن (HTTPS):' : 'Secure HTTPS Connection:'}
                  </span>
                  <p className="text-slate-300">
                    {isRtl
                      ? 'جميع متصفحات الهواتف تحظر المايكروفون تماماً على الروابط العادية (HTTP). تأكد من فتح الرابط المنشور على Vercel الذي يبدأ بـ https://.'
                      : 'Mobile browsers strictly block microphone on HTTP. Ensure you use the https:// Vercel link.'}
                  </p>
                </div>

                {/* Step 2: Permission */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <span className="font-semibold text-blue-400 block mb-0.5">
                    2️⃣ {isRtl ? 'منح إذن المايكروفون للتطبيق:' : 'App/Browser Microphone Permission:'}
                  </span>
                  <p className="text-slate-300">
                    {isRtl
                      ? 'إذا كنت تستخدم تطبيق أندرويد APK (AppsGeyser): افتح إعدادات الهاتف ➔ التطبيقات ➔ Fluently AI ➔ الأذونات (Permissions) ➔ المايكروفون ➔ اضغط «سماح دائماً».'
                      : 'If using Android APK: Go to Phone Settings ➔ Apps ➔ Fluently AI ➔ Permissions ➔ Microphone ➔ Allow.'}
                  </p>
                </div>

                {/* Step 3: Direct Recording button */}
                <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-purple-400">
                      3️⃣ {isRtl ? 'مسجل الصوت المباشر للهاتف (HTML5):' : 'Direct Mobile Audio Recorder:'}
                    </span>
                    {onOpenSettings && (
                      <button
                        onClick={onOpenSettings}
                        className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800 flex items-center gap-1 hover:bg-purple-900/70"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{isRtl ? 'الإعدادات' : 'Settings'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 mb-2">
                    {isRtl
                      ? 'تم تفعيل مسجل الصوت المباشر المتوافق مع جميع الهواتف الذكية. اضغط الزر أدناه لبدء التسجيل الصوتي فوراً:'
                      : 'Direct audio capture is enabled for all mobile devices. Tap below to start recording:'}
                  </p>
                  <button
                    onClick={startAudioCaptureRecording}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ابدأ التسجيل الصوتي المباشر الآن' : 'Start Audio Recording'}</span>
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
              isListening || isMediaRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isListening || isMediaRecording ? 'Stop Recording' : 'Start Voice Input (STT)'}
          >
            {isListening || isMediaRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 text-indigo-400" />
            )}
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
                : 'Type your message in English or tap the mic to speak...'
            }
            className="flex-1 max-h-28 resize-none bg-transparent py-2 px-2 text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed text-left font-sans"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && !isMediaRecording) || isLoading}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              (input.trim() || isMediaRecording) && !isLoading
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
