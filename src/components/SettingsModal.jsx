import React, { useState } from 'react';
import { X, Key, Cpu, Volume2, Globe, ExternalLink, ShieldCheck, Sparkles, Check, Info, VolumeX, Headphones, User } from 'lucide-react';
import { PERSONAS } from '../data/personas';
import { speechService } from '../services/speechService';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  uiLang = 'ar'
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState(settings.provider || 'gemini');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [testingPersonaId, setTestingPersonaId] = useState(null);

  if (!isOpen) return null;

  const isRtl = uiLang === 'ar';

  const handleSave = () => {
    onSaveSettings(formData);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 500);
  };

  const testPersonaVoice = (persona) => {
    if (testingPersonaId === persona.id) {
      speechService.stopSpeaking();
      setTestingPersonaId(null);
      return;
    }

    setTestingPersonaId(persona.id);
    const sampleText = `Hello! I am ${persona.name}. Listen to my unique vocal tone. I am ready to practice English with you!`;
    speechService.speak(sampleText, {
      speechId: `test_${persona.id}`,
      persona,
      rate: formData.speechRate || 0.95,
      onEnd: () => setTestingPersonaId(null),
      onError: () => setTestingPersonaId(null)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isRtl ? 'إعدادات الذكاء الاصطناعي والأصوات' : 'AI & Voice Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl ? 'تخصيص مزود الذكاء الاصطناعي، وأصوات الأساتذة الفريدة، والتحكم بالنطق' : 'Configure AI provider, unique teacher voices, and speech controls'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              speechService.stopSpeaking();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Tabs + Options) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Provider Selection Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
              {isRtl ? 'اختر مزود الذكاء الاصطناعي (AI Provider):' : 'Select AI Provider:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini', sub: 'مجاني 100% وممتاز', badge: 'موصى به' },
                { id: 'groq', label: 'Groq (Llama 3.3)', sub: 'سريع جداً ومجاني', badge: 'فائق السرعة' },
                { id: 'ollama', label: 'Ollama Offline', sub: 'محلي وبدون إنترنت', badge: 'بدون حدود' },
                { id: 'mock', label: 'Demo Mode', sub: 'تجريبي فوري', badge: 'تلقائي' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(prov.id);
                    setFormData(prev => ({ ...prev, provider: prov.id }));
                  }}
                  className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                    formData.provider === prov.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-100">{prov.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{prov.sub}</span>
                  <span className="mt-2 text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                    {prov.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Details & Key Inputs */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-4">
            {formData.provider === 'gemini' && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3 text-xs text-emerald-300">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">
                        {isRtl ? 'الخيار الأفضل والمجاني تماماً من Google' : 'Recommended & 100% Free by Google'}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {isRtl
                          ? 'يمكنك الحصول على مفتاح API مجاني غير محدود للاستخدام الشخصي من Google AI Studio خلال ثوانٍ وبدون بطاقة بنكية.'
                          : 'Get a free personal API key from Google AI Studio in 30 seconds with no credit card required.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 shrink-0 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 px-2.5 py-1.5 font-medium transition"
                  >
                    <span>{isRtl ? 'احصل على المفتاح' : 'Get Free Key'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">
                    Gemini API Key:
                  </label>
                  <input
                    type="password"
                    value={formData.geminiKey || ''}
                    onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">
                    Model:
                  </label>
                  <select
                    value={formData.geminiModel || 'gemini-3.1-pro-preview'}
                    onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (الأحدث والأشمل - موصى به)</option>
                    <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  </select>
                </div>
              </div>
            )}

            {formData.provider === 'groq' && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 bg-purple-950/20 border border-purple-800/30 rounded-xl p-3 text-xs text-purple-300">
                  <div className="flex items-start gap-2">
                    <Cpu className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                    <div>
                      <p className="font-semibold">Groq Cloud (Llama 3.3 70B + Whisper Voice)</p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {isRtl
                          ? 'استجابة فائقة السرعة مع Llama 3.3 بالإضافة إلى دعم Whisper للتسجيل الصوتي في أي متصفح مجاناً.'
                          : 'Ultra-fast sub-second responses with Llama 3.3 plus Whisper audio transcription.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 shrink-0 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 px-2.5 py-1.5 font-medium transition"
                  >
                    <span>{isRtl ? 'مفتاح Groq' : 'Get Key'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">
                    Groq API Key:
                  </label>
                  <input
                    type="password"
                    value={formData.groqKey || ''}
                    onChange={(e) => setFormData({ ...formData, groqKey: e.target.value })}
                    placeholder="gsk_..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            {formData.provider === 'ollama' && (
              <div className="space-y-3">
                <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 text-xs text-amber-300">
                  <p className="font-semibold">
                    {isRtl ? 'تشغيل محلي بالكامل بدون إنترنت (100% Offline)' : '100% Local & Offline via Ollama'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {isRtl
                      ? 'لا يحتاج إلى أي مفتاح ولا يرسل أي بيانات لخوادم خارجية. يتطلب تثبيت برنامج Ollama على جهازك وتشغيل نموذج مثل llama3.'
                      : 'Zero API keys required. Runs completely on your device through Ollama.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">
                      Ollama Endpoint URL:
                    </label>
                    <input
                      type="text"
                      value={formData.ollamaUrl || 'http://localhost:11434'}
                      onChange={(e) => setFormData({ ...formData, ollamaUrl: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">
                      Model Tag:
                    </label>
                    <input
                      type="text"
                      value={formData.ollamaModel || 'llama3:latest'}
                      onChange={(e) => setFormData({ ...formData, ollamaModel: e.target.value })}
                      placeholder="llama3:latest, qwen2.5, mistral"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.provider === 'mock' && (
              <div className="bg-slate-900 rounded-xl p-3 text-xs text-slate-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-400" />
                  {isRtl ? 'المحرك التجريبي المدمج الذكي' : 'Built-in Intelligent Demo Engine'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isRtl
                    ? 'يعمل مباشرة بدون إدخال أي مفاتيح أو برامج خارجية. يكتشف مئات الأخطاء النحوية الشائعة ويقدم تصحيحات وشروحات بديهية لتجربة التطبيق فوراً.'
                    : 'Works out of the box with zero configuration for immediate testing and rule checking.'}
                </p>
              </div>
            )}
          </div>

          {/* Persona Voice Gallery & Live Tester */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{isRtl ? 'معرض أصوات الأساتذة (نبرة صوت مستقلة لكل شخصية):' : 'Tutor Distinct Voice Profiles:'}</span>
              <span className="text-[10px] text-indigo-400 font-mono">5 Unique Voice Timbres</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERSONAS.map((p) => {
                const isPlaying = testingPersonaId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-950/70 border border-slate-800 p-2.5 px-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{p.voiceConfig?.vocalTone}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => testPersonaVoice(p)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 border ${
                        isPlaying
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/40'
                      }`}
                    >
                      {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isPlaying ? (isRtl ? 'إيقاف' : 'Stop') : (isRtl ? 'استمع' : 'Test')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice & Speech Preferences */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {isRtl ? 'إعدادات التشغيل والتحكم بالنطق:' : 'Speech Playback Controls:'}
            </label>

            {/* Auto-Speak Toggle Switch */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  {isRtl ? 'قراءة ردود الأستاذ صوتياً بشكل تلقائي' : 'Auto-Read AI Replies'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                  {isRtl
                    ? 'عند تعطيل هذا الخيار، لن يتحدث الأستاذ إلا عند نقرك على زر الاستماع 🔊 بجانب الرسالة، مما يمنع تكرار الصوت تلقائياً.'
                    : 'When disabled, speech only plays when you click the listen icon on a message.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoSpeak: !formData.autoSpeak })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.autoSpeak ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  {isRtl ? 'اللهجة الافتراضية:' : 'Default Accent:'}
                </label>
                <select
                  value={formData.accent || 'en-US'}
                  onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="en-US">🇺🇸 American English (لهجة أمريكية)</option>
                  <option value="en-GB">🇬🇧 British English (لهجة بريطانية)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  {isRtl ? 'لغة شرح القواعد والتصحيح:' : 'Explanation Language:'}
                </label>
                <select
                  value={formData.explanationLang || 'ar'}
                  onChange={(e) => setFormData({ ...formData, explanationLang: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ar">العربية (شرح القواعد وترجمة المصطلحات بالعربي)</option>
                  <option value="en">English (All explanations in English)</option>
                </select>
              </div>
            </div>

            {/* Speed slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{isRtl ? 'سرعة نطق الأستاذ:' : 'Speech Speed:'}</span>
                <span className="font-mono text-indigo-400">{formData.speechRate || 0.95}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={formData.speechRate || 0.95}
                onChange={(e) => setFormData({ ...formData, speechRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{isRtl ? 'بطيء للمبتدئين' : 'Slow (0.7x)'}</span>
                <span>{isRtl ? 'طبيعي' : 'Normal (1.0x)'}</span>
                <span>{isRtl ? 'سريع' : 'Fast (1.3x)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              speechService.stopSpeaking();
              onClose();
            }}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            {isSavedNotice ? <Check className="w-4 h-4" /> : null}
            <span>{isSavedNotice ? (isRtl ? 'تم الحفظ بنجاح!' : 'Saved!') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
