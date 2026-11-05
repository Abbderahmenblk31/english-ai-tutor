import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, CheckCircle2, Cloud } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import VocabularyModal from './components/VocabularyModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import PlacementTestModal from './components/PlacementTestModal';
import LessonSummaryModal from './components/LessonSummaryModal';

import { PERSONAS } from './data/personas';
import { TOPICS } from './data/topics';
import { sendMessageToAI } from './services/aiService';
import { speechService } from './services/speechService';
import {
  getCurrentUser,
  syncLocalDataToCloud
} from './services/authService';
import {
  getSettings,
  saveSettings,
  getStats,
  incrementStats,
  getVocabularyVault,
  saveVocabularyWord,
  removeVocabularyWord,
  getChatHistory,
  saveChatHistory,
  clearChatHistory
} from './services/storageService';

export default function App() {
  const [settings, setSettings] = useState(getSettings());
  const [stats, setStats] = useState(getStats());
  const [savedWords, setSavedWords] = useState(getVocabularyVault());
  const [user, setUser] = useState(getCurrentUser());

  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [activeTopic, setActiveTopic] = useState(TOPICS[0]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Modals & Navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const [inputPrefill, setInputPrefill] = useState('');

  // New Modals from Sessions 1 & 2
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isLessonSummaryOpen, setIsLessonSummaryOpen] = useState(false);
  const [cloudToast, setCloudToast] = useState('');

  const chatKey = `${activePersona.id}_${activeTopic.id}`;

  // Initialize or restore conversation when persona or topic changes
  useEffect(() => {
    const cached = getChatHistory(chatKey);
    if (cached && cached.length > 0) {
      setMessages(cached);
    } else {
      // Generate initial greeting from active persona
      const initialGreeting = {
        id: 'initial_msg',
        role: 'assistant',
        content: activeTopic.starter || `Hello! I am ${activePersona.name}. Ready for today's English conversation practice? Let's start!`,
        translation: activeTopic.starterAr || "مرحباً بك! أنا أستاذك لممارسة الإنجليزية اليوم. هل أنت جاهز للبدء؟",
        suggestedReplies: activeTopic.suggestedReplies || [],
        timestamp: Date.now()
      };
      setMessages([initialGreeting]);
      saveChatHistory(chatKey, [initialGreeting]);
    }
  }, [chatKey]);

  // Keep chat history updated in localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(chatKey, messages);
    }
  }, [messages, chatKey]);

  // Play audio with persona-specific voice profiling
  const handlePlaySpeech = (id, text, persona = activePersona) => {
    setSpeakingMessageId(id);
    speechService.speak(text, {
      speechId: id,
      persona: persona || activePersona,
      rate: settings.speechRate || 0.95,
      onStart: () => setSpeakingMessageId(id),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null)
    });
  };

  const handleStopSpeech = () => {
    speechService.stopSpeaking();
    setSpeakingMessageId(null);
  };

  // Send user message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // Stop speaking previous response
    handleStopSpeech();

    const userMsgId = `user_${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Call AI service
      const aiResponse = await sendMessageToAI({
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        persona: activePersona,
        topic: activeTopic,
        settings
      });

      // Attach feedback to user message
      const updatedMessagesWithFeedback = newMessages.map(m =>
        m.id === userMsgId ? { ...m, feedback: aiResponse } : m
      );

      // Create assistant reply message
      const assistantMsgId = `assistant_${Date.now()}`;
      const assistantMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: aiResponse.reply || "I heard you! Let's keep exploring.",
        translation: aiResponse.replyAr || null,
        suggestedReplies: aiResponse.suggestedReplies || [],
        feedback: aiResponse,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessagesWithFeedback, assistantMessage];
      setMessages(finalMessages);

      // Update statistics
      const correctionsCount = (aiResponse.corrections || []).length;
      const updatedStats = incrementStats(1, correctionsCount);
      setStats(updatedStats);

      // Trigger celebratory confetti if user completes daily goal!
      if (updatedStats.dailyProgress === updatedStats.dailyGoal) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Background cloud sync for logged in users
      if (user && !user.isGuest) {
        syncLocalDataToCloud(user).catch(() => {});
      }

      // Auto speak if enabled
      if (settings.autoSpeak && assistantMessage.content) {
        handlePlaySpeech(assistantMsgId, assistantMessage.content, activePersona);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: isRtl 
          ? `⚠️ تعذر استلام الرد: ${error.message || 'حدث خطأ في الاتصال بالذكاء الاصطناعي'}. يرجى المحاولة مرة أخرى أو التأكد من المفتاح.`
          : `⚠️ Connection error: ${error.message || 'Failed to reach AI service'}. Please try again or check your API key.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWord = (wordItem) => {
    const updated = saveVocabularyWord(wordItem);
    setSavedWords(updated);
    if (user && !user.isGuest) {
      syncLocalDataToCloud(user).catch(() => {});
    }
  };

  const handleRemoveWord = (wordId) => {
    const updated = removeVocabularyWord(wordId);
    setSavedWords(updated);
    if (user && !user.isGuest) {
      syncLocalDataToCloud(user).catch(() => {});
    }
  };

  const handleResetChat = () => {
    clearChatHistory(chatKey);
    const initial = {
      id: `initial_${Date.now()}`,
      role: 'assistant',
      content: activeTopic.starter || `Hello! I am ${activePersona.name}. Ready for today's English conversation practice? Let's start!`,
      translation: activeTopic.starterAr || "مرحباً بك! أنا أستاذك لممارسة الإنجليزية اليوم. هل أنت جاهز للبدء؟",
      suggestedReplies: activeTopic.suggestedReplies || [],
      timestamp: Date.now()
    };
    setMessages([initial]);
    handleStopSpeech();
  };

  const handleConfirmResetChat = () => {
    handleResetChat();
    setIsResetConfirmOpen(false);
    setResetToast(true);
    setTimeout(() => setResetToast(false), 3500);
  };

  const handleUpdateSettings = (newSettings) => {
    const saved = saveSettings(newSettings);
    setSettings(saved);
  };

  const handleToggleSound = () => {
    const updated = saveSettings({ autoSpeak: !settings.autoSpeak });
    setSettings(updated);
    if (!updated.autoSpeak) {
      handleStopSpeech();
    }
  };

  const handleToggleLanguage = () => {
    const newLang = settings.uiLanguage === 'ar' ? 'en' : 'ar';
    const updated = saveSettings({ uiLanguage: newLang });
    setSettings(updated);
  };

  const handleLoginSuccess = async (newUser) => {
    setUser(newUser);
    const toast = isRtl
      ? `مرحباً بك ${newUser.name}! تم دمج بياناتك وحفظها سحابياً بنجاح ☁️`
      : `Welcome ${newUser.name}! Your data is safely synced to the cloud ☁️`;
    setCloudToast(toast);
    setTimeout(() => setCloudToast(''), 4500);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    await syncLocalDataToCloud(newUser);
  };

  const isRtl = settings.uiLanguage === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activePersona={activePersona}
        onSelectPersona={(persona) => {
          setActivePersona(persona);
          handleStopSpeech();
        }}
        activeTopic={activeTopic}
        onSelectTopic={(topic) => {
          setActiveTopic(topic);
          handleStopSpeech();
        }}
        userLevel={settings.userLevel || 'Intermediate'}
        onChangeLevel={(level) => handleUpdateSettings({ userLevel: level })}
        onResetChat={() => setIsResetConfirmOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVocabulary={() => setIsVocabOpen(true)}
        stats={stats}
        uiLang={settings.uiLanguage}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
        onOpenLessonSummary={() => setIsLessonSummaryOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          stats={stats}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenVocabulary={() => setIsVocabOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onResetChat={() => setIsResetConfirmOpen(true)}
          savedWordsCount={savedWords.length}
          activePersona={activePersona}
          onToggleLanguage={handleToggleLanguage}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenLessonSummary={() => setIsLessonSummaryOpen(true)}
          onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
        />

        {/* Chat Feed */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          activePersona={activePersona}
          activeTopic={activeTopic}
          onPlaySpeech={handlePlaySpeech}
          onStopSpeech={handleStopSpeech}
          speakingMessageId={speakingMessageId}
          autoSpeak={settings.autoSpeak}
          onToggleAutoSpeak={handleToggleSound}
          onSaveWord={handleSaveWord}
          savedWords={savedWords}
          accent={activePersona.accent || settings.accent}
          uiLang={settings.uiLanguage}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          onPrefillInput={(text) => setInputPrefill(text)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetChat={() => setIsResetConfirmOpen(true)}
        />

        {/* Input Bar */}
        <InputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          uiLang={settings.uiLanguage}
          prefillValue={inputPrefill}
          onClearPrefill={() => setInputPrefill('')}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
        uiLang={settings.uiLanguage}
      />

      {/* Vocabulary Vault Modal */}
      <VocabularyModal
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        savedWords={savedWords}
        onRemoveWord={handleRemoveWord}
        onAddWord={handleSaveWord}
        accent={activePersona.accent || settings.accent}
        uiLang={settings.uiLanguage}
      />

      {/* Google Auth Modal (Session 2 Output) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        uiLang={settings.uiLanguage}
      />

      {/* User Profile & Cloud Sync Modal (Session 2 Output) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        stats={stats}
        savedWordsCount={savedWords.length}
        userLevel={settings.userLevel || 'Intermediate'}
        onUserChange={(updatedUser) => setUser(updatedUser)}
        onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        uiLang={settings.uiLanguage}
      />

      {/* CEFR Placement Diagnostic Test Modal (Session 1 Output) */}
      <PlacementTestModal
        isOpen={isPlacementTestOpen}
        onClose={() => setIsPlacementTestOpen(false)}
        currentLevel={settings.userLevel || 'Intermediate'}
        onSaveLevel={(newLevel) => handleUpdateSettings({ userLevel: newLevel })}
        uiLang={settings.uiLanguage}
      />

      {/* Lesson Summary & Notes Export Modal (Session 1 Output) */}
      <LessonSummaryModal
        isOpen={isLessonSummaryOpen}
        onClose={() => setIsLessonSummaryOpen(false)}
        messages={messages}
        activePersona={activePersona}
        activeTopic={activeTopic}
        savedWords={savedWords}
        uiLang={settings.uiLanguage}
      />

      {/* Reset / Clear Chat Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isRtl ? 'فسخ المحادثة والبدء من جديد؟' : 'Clear Chat & Start Fresh?'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activePersona.name} &bull; {isRtl ? activeTopic.titleAr : activeTopic.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              {isRtl
                ? 'سيتم مسح جميع الرسائل والتصحيحات في محادثتك الحالية مع الأستاذ والبدء من جديد من أول رسالة. هل تريد المتابعة؟'
                : 'All messages, corrections, and notes in this active session will be cleared and reset to the beginning. Are you sure you want to proceed?'}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmResetChat}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نعم، افسخ وابدأ من جديد' : 'Yes, Clear & Start Fresh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync Toast */}
      {cloudToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/95 border border-indigo-500/50 text-indigo-200 shadow-2xl backdrop-blur-md text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <Cloud className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{cloudToast}</span>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 shadow-2xl backdrop-blur-md text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? `تم فسخ المحادثة بنجاح وبدء جلسة جديدة مع ${activePersona.name}! ✨` : `Conversation cleared successfully! Starting fresh with ${activePersona.name}! ✨`}</span>
        </div>
      )}
    </div>
  );
}
