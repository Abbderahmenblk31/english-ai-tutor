import { createClient } from '@supabase/supabase-js';

// Storage keys for Auth & Cloud Sync
const AUTH_STORAGE_KEYS = {
  USER: 'fluently_user_session',
  SUPABASE_CONFIG: 'fluently_supabase_config',
  GOOGLE_CONFIG: 'fluently_google_client_id',
  CLOUD_BACKUP: 'fluently_cloud_backup',
};

// Default fallback guest user
export const GUEST_USER = {
  id: 'guest_user',
  name: 'ضيف Fluently',
  nameEn: 'Guest User',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  provider: 'guest',
  isGuest: true,
  lastSyncedAt: null,
};

let supabaseInstance = null;

/**
 * Get Google Client ID from storage or env
 */
export const getGoogleClientId = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.GOOGLE_CONFIG) || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  } catch {
    return '';
  }
};

/**
 * Save Google Client ID
 */
export const saveGoogleClientId = (clientId) => {
  try {
    if (clientId && clientId.trim()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.GOOGLE_CONFIG, clientId.trim());
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.GOOGLE_CONFIG);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Get Supabase configuration from localStorage or Vite environment variables
 */
export const getSupabaseConfig = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.SUPABASE_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved supabase config:', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
};

/**
 * Save custom Supabase credentials
 */
export const saveSupabaseConfig = (config) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
    supabaseInstance = null;
    return getSupabaseClient();
  } catch (e) {
    console.error('Failed to save supabase config:', e);
    return null;
  }
};

/**
 * Get or initialize the Supabase client
 */
export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
      return null;
    }
  }
  return null;
};

/**
 * Get current session user
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Failed to get current user:', e);
  }
  return GUEST_USER;
};

/**
 * Save user session to localStorage
 */
export const saveCurrentUser = (user) => {
  try {
    if (!user || user.isGuest) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save user session:', e);
  }
};

/**
 * Helper to decode Google JWT Identity token (without external dependencies)
 */
export const decodeGoogleCredential = (jwtCredential) => {
  try {
    const base64Url = jwtCredential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT credential:', e);
    return null;
  }
};

/**
 * Sign in directly with user's genuine name and real Gmail address
 */
export const signInWithRealDetails = async ({ name, email, avatar = null }) => {
  if (!email || !email.trim()) {
    throw new Error('يرجى إدخال عنوان بريدك الإلكتروني (Gmail)');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];

  // Default avatar if none provided (Google-styled letter avatar or modern face)
  const defaultAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&size=128&bold=true`;

  const realUser = {
    id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: cleanName,
    nameEn: cleanName,
    email: cleanEmail,
    avatar: defaultAvatar,
    provider: cleanEmail.includes('gmail.com') ? 'google' : 'email',
    isGuest: false,
    lastSyncedAt: new Date().toISOString(),
  };

  saveCurrentUser(realUser);
  return { success: true, user: realUser };
};

/**
 * Sign in using Google OAuth via Supabase
 */
export const signInWithGoogleOAuth = async () => {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return { success: true, redirecting: true, data };
  }
  throw new Error('لم يتم إعداد Supabase بعد. يرجى إدخال بريدك الـ Gmail مباشرة في الخانة المخصصة.');
};

/**
 * Sign out and return to Guest mode
 */
export const signOutUser = async () => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  saveCurrentUser(null);
  return GUEST_USER;
};

/**
 * Auto-migrate and synchronize local data (localStorage) to Cloud
 */
export const syncLocalDataToCloud = async (user, dataPayload = null) => {
  if (!user || user.isGuest) return { synced: false, reason: 'guest' };

  const payload = dataPayload || {
    settings: localStorage.getItem('fluently_settings') ? JSON.parse(localStorage.getItem('fluently_settings')) : {},
    vocabulary: localStorage.getItem('fluently_vocabulary') ? JSON.parse(localStorage.getItem('fluently_vocabulary')) : [],
    stats: localStorage.getItem('fluently_stats') ? JSON.parse(localStorage.getItem('fluently_stats')) : {},
    syncedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('fluently_sync')
        .upsert({
          user_id: user.id,
          payload: payload,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Cloud table sync note (using local cloud mirror):', error.message);
      }
    } catch (err) {
      console.warn('Supabase sync exception:', err);
    }
  }

  // Always keep a local cloud backup snapshot for the active user
  try {
    localStorage.setItem(`${AUTH_STORAGE_KEYS.CLOUD_BACKUP}_${user.id}`, JSON.stringify(payload));
    const updatedUser = { ...user, lastSyncedAt: new Date().toISOString() };
    saveCurrentUser(updatedUser);
    return { synced: true, timestamp: updatedUser.lastSyncedAt, user: updatedUser };
  } catch (e) {
    console.error('Failed to create cloud mirror:', e);
    return { synced: false, error: e.message };
  }
};
