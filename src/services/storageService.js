const STORAGE_KEYS = {
  SETTINGS: 'fluently_settings',
  VOCABULARY: 'fluently_vocabulary',
  STATS: 'fluently_stats',
  CHATS: 'fluently_chats',
};

const DEFAULT_SETTINGS = {
  provider: 'gemini', // 'gemini' | 'groq' | 'ollama' | 'openai' | 'mock'
  geminiKey: '',
  groqKey: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3:latest',
  openaiKey: '',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-2.5-flash',
  groqModel: 'llama-3.3-70b-versatile',
  accent: 'en-US',
  speechRate: 0.95,
  autoSpeak: true,
  uiLanguage: 'ar', // 'ar' or 'en'
  userLevel: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced'
  explanationLang: 'ar', // 'ar' or 'en'
  theme: 'dark'
};

export const getSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    // Auto-migrate sunset/deprecated models
    const deprecated = ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
    if (!parsed.geminiModel || deprecated.includes(parsed.geminiModel)) {
      parsed.geminiModel = 'gemini-2.5-flash';
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  try {
    const updated = { ...getSettings(), ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return newSettings;
  }
};

export const getStats = () => {
  const defaultStats = {
    streakDays: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    totalMessages: 0,
    correctionsLearned: 0,
    wordsSaved: 0,
    dailyGoal: 10,
    dailyProgress: 0,
  };

  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return defaultStats;
    const stats = JSON.parse(data);
    const today = new Date().toISOString().slice(0, 10);
    
    // Check streak
    if (stats.lastActiveDate !== today) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streakDays = (stats.streakDays || 1) + 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
      stats.dailyProgress = 0; // reset daily counter
      stats.lastActiveDate = today;
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }
    return stats;
  } catch {
    return defaultStats;
  }
};

export const incrementStats = (msgCount = 1, correctionsCount = 0) => {
  try {
    const stats = getStats();
    stats.totalMessages = (stats.totalMessages || 0) + msgCount;
    stats.dailyProgress = (stats.dailyProgress || 0) + msgCount;
    stats.correctionsLearned = (stats.correctionsLearned || 0) + correctionsCount;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  } catch (e) {
    console.error('Failed to update stats:', e);
    return getStats();
  }
};

export const getVocabularyVault = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveVocabularyWord = (wordItem) => {
  try {
    const list = getVocabularyVault();
    // avoid duplicates
    if (!list.some(item => item.word.toLowerCase() === wordItem.word.toLowerCase())) {
      const updated = [
        {
          id: Date.now().toString(),
          dateAdded: new Date().toISOString(),
          ...wordItem
        },
        ...list
      ];
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(updated));
      return updated;
    }
    return list;
  } catch (e) {
    console.error('Failed to save vocabulary:', e);
    return getVocabularyVault();
  }
};

export const removeVocabularyWord = (id) => {
  try {
    const list = getVocabularyVault();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to remove vocabulary:', e);
    return getVocabularyVault();
  }
};

export const getChatHistory = (chatKey) => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${chatKey}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveChatHistory = (chatKey, messages) => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.CHATS}_${chatKey}`, JSON.stringify(messages.slice(-50)));
  } catch (e) {
    console.error('Failed to save chat:', e);
  }
};

export const clearChatHistory = (chatKey) => {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.CHATS}_${chatKey}`);
  } catch (e) {
    console.error('Failed to clear chat:', e);
  }
};
