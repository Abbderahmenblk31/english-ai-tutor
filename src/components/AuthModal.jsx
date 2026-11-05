import React, { useState, useEffect } from 'react';
import { X, Cloud, ShieldCheck, Mail, User, CheckCircle2, ChevronDown, ChevronUp, Key, ExternalLink } from 'lucide-react';
import { 
  signInWithRealDetails, 
  getGoogleClientId, 
  saveGoogleClientId, 
  decodeGoogleCredential 
} from '../services/authService';

const AVATAR_OPTIONS = [
  { id: 'google_blue', label: 'Google Letter', url: null },
  { id: 'avatar_1', label: 'Male 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces' },
  { id: 'avatar_2', label: 'Female 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces' },
  { id: 'avatar_3', label: 'Male 2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces' },
  { id: 'avatar_4', label: 'Female 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces' },
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess, uiLang = 'ar' }) {
  const isRtl = uiLang === 'ar';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Official Google Client ID settings
  const [googleClientId, setGoogleClientIdState] = useState(getGoogleClientId());
  const [showGisSettings, setShowGisSettings] = useState(false);

  // Initialize Google Identity Services (GIS) if Client ID is configured
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    // Load Google GIS script dynamically
    const scriptId = 'google-gis-script';
    let script = document.getElementById(scriptId);

    const initGis = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              const decoded = decodeGoogleCredential(response.credential);
              if (decoded) {
                const userObj = {
                  name: decoded.name || decoded.given_name || 'Google User',
                  email: decoded.email,
                  avatar: decoded.picture || null,
                };
                signInWithRealDetails(userObj).then((res) => {
                  if (res.user) {
                    onLoginSuccess(res.user);
                    onClose();
                  }
                });
              }
            }
          },
        });

        // Render official Google button into placeholder if exists
        const btnContainer = document.getElementById('official-google-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: 320,
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGis;
      document.body.appendChild(script);
    } else {
      initGis();
    }
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  const handleRealSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال بريدك الـ Gmail' : 'Please enter your Gmail address');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const avatarUrl = selectedAvatar.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=4285F4&color=fff&size=128&bold=true`;
      const res = await signInWithRealDetails({
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        avatar: avatarUrl,
      });

      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || (isRtl ? 'فشل تسجيل الدخول' : 'Sign in failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGoogleClientId = (e) => {
    e.preventDefault();
    saveGoogleClientId(googleClientId);
    setShowGisSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-indigo-500/30 bg-slate-900/95 p-6 sm:p-7 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Cloud className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {isRtl ? 'تسجيل الدخول بحسابك (Google / Gmail)' : 'Sign In with Your Gmail Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isRtl 
              ? 'أدخل بياناتك الحقيقية لربط محادثاتك ومفرداتك بحسابك الشخصي ومزامنتها سحابياً.' 
              : 'Enter your real Gmail details to keep your practice and vocabulary safely synced.'}
          </p>
        </div>

        {/* Official Google Button (if Client ID configured) */}
        {googleClientId && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">
              {isRtl ? 'نافذة Google الرسمية المباشرة:' : 'Official Google Sign-In Window:'}
            </span>
            <div id="official-google-btn-container" className="flex justify-center" />
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500"><span className="bg-slate-900 px-2">{isRtl ? 'أو أدخل بياناتك مباشرة أدناه' : 'or enter details below'}</span></div>
            </div>
          </div>
        )}

        {/* Real User Input Form */}
        <form onSubmit={handleRealSignIn} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              ❌ {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isRtl ? 'اسمك الكامل (الاسم الذي يناديك به الأستاذ):' : 'Your Full Name:'}</span>
            </label>
            <input
              type="text"
              required
              placeholder={isRtl ? 'مثال: عبد الرحمن' : 'e.g. Abderrahmen'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Gmail Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>{isRtl ? 'بريدك الإلكتروني (Gmail الحقيقي الخاص بك):' : 'Your Real Gmail Address:'}</span>
            </label>
            <input
              type="email"
              required
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {isRtl ? 'اختر صورة البروفايل:' : 'Choose Profile Avatar:'}
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setSelectedAvatar(av)}
                  className={`relative rounded-xl p-1 border transition ${
                    selectedAvatar.id === av.id
                      ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/40'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  {av.url ? (
                    <img src={av.url} alt={av.label} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {name ? name.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  {selectedAvatar.id === av.id && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-slate-950" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer mt-2"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>
              {isLoading 
                ? (isRtl ? 'جاري تفعيل الحساب ومزامنة البيانات...' : 'Activating & Syncing...') 
                : (isRtl ? 'تأكيد تسجيل الدخول بـ Gmail ومزامنة بياناتي ☁️' : 'Sign In with Gmail & Sync My Data ☁️')}
            </span>
          </button>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            {isRtl ? 'المتابعة كضيف (بدون حساب الآن)' : 'Continue as Guest'}
          </button>
        </form>

        {/* Optional: Configure Official Google Client ID */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowGisSettings(!showGisSettings)}
            className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-indigo-400 transition"
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'تفعيل نافذة Google المنبثقة الرسمية (OAuth Client ID)' : 'Official Google OAuth Client ID'}</span>
            </span>
            {showGisSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showGisSettings && (
            <form onSubmit={handleSaveGoogleClientId} className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isRtl 
                  ? 'إذا أردت ظهور شاشة Google الرسمية المنبثقة لاختيار الحساب بنقرة واحدة، أدخل الـ Google OAuth Client ID من Google Cloud Console:' 
                  : 'Enter your Google OAuth Client ID from Google Cloud Console to enable Google One-Tap Popup:'}
              </p>
              <input
                type="text"
                placeholder="xxxx.apps.googleusercontent.com"
                value={googleClientId}
                onChange={(e) => setGoogleClientIdState(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition"
                >
                  {isRtl ? 'حفظ وتفعيل' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
