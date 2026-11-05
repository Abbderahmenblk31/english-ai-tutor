import React, { useState } from 'react';
import { X, Cloud, ShieldCheck, Sparkles, ChevronDown, ChevronUp, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle, getSupabaseConfig, saveSupabaseConfig } from '../services/authService';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, uiLang = 'ar' }) {
  const isRtl = uiLang === 'ar';
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setErrorMsg(err.message || (isRtl ? 'حدث خطأ أثناء الاتصال بحساب قوقل' : 'Error connecting to Google'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md rounded-3xl border border-indigo-500/30 bg-slate-900/95 p-6 sm:p-7 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 mb-3.5">
            <Cloud className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isRtl ? 'المزامنة السحابية مع Google' : 'Cloud Sync with Google'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isRtl 
              ? 'احفظ تقدمك، كلماتك، وسجل محادثاتك عبر جميع أجهزتك دون انقطاع.' 
              : 'Keep your chats, vocabulary, and streak safely synced across all your devices.'}
          </p>
        </div>

        {/* Value Proposition Points */}
        <div className="mb-6 space-y-2.5 bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>{isRtl ? 'مزامنة فورية بين الهاتف والحاسوب' : 'Instant sync between mobile & desktop'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>{isRtl ? 'حماية قاموس الكلمات من الضياع عند مسح المتصفح' : 'Keep your saved vocabulary safe from browser resets'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span>{isRtl ? 'دمج تلقائي لكافة محادثاتك وكلماتك السابقة' : 'Auto-merge all existing chats into your cloud account'}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign-in Main Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/40 transition active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {isLoading 
                ? (isRtl ? 'جاري الاتصال السحابي...' : 'Connecting to Google...') 
                : (isRtl ? 'المتابعة باستخدام Google' : 'Continue with Google')}
            </span>
          </button>

          {/* Guest Mode Button (No friction) */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
          >
            {isRtl ? 'المتابعة كضيف (بدون حساب الآن)' : 'Continue as Guest (No account needed)'}
          </button>
        </div>

        {/* Optional Supabase Cloud Settings Drawer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-indigo-400 transition"
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isRtl ? 'إعدادات قاعدة بيانات Supabase (اختياري)' : 'Supabase Cloud Config (Optional)'}</span>
            </span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 space-y-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs animate-in fade-in">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {isRtl ? 'رابط مشروع Supabase (URL)' : 'Supabase Project URL'}
                </label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, url: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  {isRtl ? 'المفتاح العام (Anon Public Key)' : 'Anon Public Key'}
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, anonKey: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                >
                  {isRtl ? 'حفظ الإعدادات' : 'Save Config'}
                </button>
                {configSavedToast && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    {isRtl ? '✓ تم الحفظ' : '✓ Saved!'}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
