import React, { useState } from 'react';
import { X, Cloud, RefreshCw, Download, LogOut, CheckCircle2, User, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { syncLocalDataToCloud, signOutUser } from '../services/authService';

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  stats,
  savedWordsCount = 0,
  userLevel = 'Intermediate',
  onUserChange,
  onOpenPlacementTest,
  onOpenAuth,
  uiLang = 'ar'
}) {
  const isRtl = uiLang === 'ar';
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);

  if (!isOpen || !user) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLocalDataToCloud(user);
      if (res.user) {
        onUserChange(res.user);
      }
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 3000);
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        user: {
          name: user.name,
          email: user.email,
          provider: user.provider
        },
        stats: stats || {},
        settings: localStorage.getItem('fluently_settings') ? JSON.parse(localStorage.getItem('fluently_settings')) : {},
        vocabulary: localStorage.getItem('fluently_vocabulary') ? JSON.parse(localStorage.getItem('fluently_vocabulary')) : [],
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fluently-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export backup:', e);
    }
  };

  const handleSignOut = async () => {
    const guestUser = await signOutUser();
    onUserChange(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-800">
          <div className="relative mb-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces'}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow" title="Cloud Active">
              <Cloud className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5">
            <span>{user.name}</span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {user.isGuest ? (isRtl ? 'ضيف' : 'Guest') : 'Google'}
            </span>
          </h3>
          {user.email && (
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          )}

          {/* Sync indicator pill */}
          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-950/70 border border-slate-800 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isRtl ? 'السحابة متصلة ومزامنة' : 'Cloud Sync Connected'}
            </span>
          </div>
        </div>

        {/* User Quick Stats Overview */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] text-slate-400 block">{isRtl ? 'المستوى' : 'Level'}</span>
            <span className="text-xs font-black text-indigo-400">{userLevel}</span>
          </div>
          <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] text-slate-400 block">{isRtl ? 'سلسلة الأيام' : 'Streak'}</span>
            <span className="text-xs font-black text-orange-400">🔥 {stats.streakDays || 1}</span>
          </div>
          <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] text-slate-400 block">{isRtl ? 'القاموس' : 'Vault'}</span>
            <span className="text-xs font-black text-purple-400">📚 {savedWordsCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Sync Now Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isRtl ? 'جاري المزامنة...' : 'Syncing...') : (isRtl ? 'مزامنة البيانات سحابياً الآن' : 'Sync Data to Cloud Now')}</span>
            </span>
            {syncToast ? (
              <span className="text-emerald-400 text-[11px] font-bold">{isRtl ? '✓ تم التحديث' : '✓ Synced!'}</span>
            ) : (
              <span className="text-[10px] text-slate-500">{user.lastSyncedAt ? new Date(user.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            )}
          </button>

          {/* CEFR Placement Test Shortcut */}
          <button
            onClick={() => {
              onClose();
              if (onOpenPlacementTest) onOpenPlacementTest();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isRtl ? 'اختبار تحديد المستوى (CEFR)' : 'Take CEFR Placement Test'}</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">{isRtl ? 'ابدأ الآن' : 'Start'}</span>
          </button>

          {/* Backup Export Button */}
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? 'تصدير نسخة احتياطية (JSON)' : 'Export Full Backup (JSON)'}</span>
            </span>
            <span className="text-[10px] text-slate-500">.json</span>
          </button>
        </div>

        {/* Footer: Switch Account & Sign Out */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onOpenAuth) onOpenAuth();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تبديل أو تعديل الحساب' : 'Switch Account'}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
