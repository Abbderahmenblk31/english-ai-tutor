// Advanced Speech Synthesis and Recognition Service
// Features: Persona-Specific Voice Profiling, Gender/Timbre Matching, Anti-Looping & Anti-GC Freeze Guards

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.voices = [];
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isMediaRecording = false;
    this.currentUtterance = null;
    this.currentSpeechId = null;

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    return this.voices;
  }

  /**
   * Intelligently selects the best matching voice for a specific persona
   * considering accent (en-US / en-GB), gender (male / female), and neural/natural quality.
   */
  getVoiceForPersona(persona) {
    if (!this.voices.length) this.loadVoices();
    if (!this.voices.length) return null;

    const config = persona?.voiceConfig || {};
    const targetLang = (config.lang || persona?.accent || 'en-US').toLowerCase().replace('_', '-');
    const targetGender = config.gender || 'female'; // 'male' | 'female'
    const preferredNames = config.preferredVoices || [];

    // Filter all English voices
    const allEnglishVoices = this.voices.filter(v => {
      const l = v.lang.replace('_', '-').toLowerCase();
      return l.startsWith('en');
    });

    // Filter voices matching the exact accent (e.g. en-US or en-GB)
    const exactLangVoices = allEnglishVoices.filter(v => 
      v.lang.replace('_', '-').toLowerCase().startsWith(targetLang)
    );

    const candidates = exactLangVoices.length > 0 ? exactLangVoices : allEnglishVoices;

    // Helper to test if a voice name indicates male or female
    const isMaleName = (name) => {
      const lower = name.toLowerCase();
      return /david|george|ryan|guy|mark|daniel|oliver|christopher|james|brian|richard|male/i.test(lower);
    };

    const isFemaleName = (name) => {
      const lower = name.toLowerCase();
      return /jenny|aria|zira|samantha|sonia|libby|hazel|susan|victoria|karen|catherine|female/i.test(lower);
    };

    // 1. Try to find an exact match from the persona's preferred voice names
    for (const pref of preferredNames) {
      const found = candidates.find(v => v.name.toLowerCase().includes(pref.toLowerCase()));
      if (found) {
        return found;
      }
    }

    // 2. Filter by requested gender
    const genderMatched = candidates.filter(v => {
      if (targetGender === 'male') {
        return isMaleName(v.name) && !isFemaleName(v.name);
      } else {
        return isFemaleName(v.name) && !isMaleName(v.name);
      }
    });

    if (genderMatched.length > 0) {
      // Prefer Natural / Neural / Google voices among gender matches
      const natural = genderMatched.find(v => /natural|neural|google|online/i.test(v.name));
      return natural || genderMatched[0];
    }

    // 3. Fallback to any voice with matching accent
    return candidates[0] || this.voices[0] || null;
  }

  /**
   * High-Precision Speak method:
   * - Eliminates audio overlap
   * - Cancels stuck Chrome speech queue
   * - Applies persona-specific pitch & rate modulation
   * - Keeps global reference to prevent GC interruption
   */
  speak(text, {
    speechId = null,
    persona = null,
    accent = 'en-US',
    rate = 1.0,
    pitch = 1.0,
    onStart,
    onEnd,
    onError
  } = {}) {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported on this browser');
      return;
    }

    // Completely cancel previous audio to prevent duplicate or looping audio
    this.stopSpeaking();

    // Clean text of markdown, asterisks, emoji, quotes for crystal-clear pronunciation
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/[“”]/g, '"')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return;

    // Pick persona-specific voice
    const matchedVoice = this.getVoiceForPersona(persona);
    const personaPitch = persona?.voiceConfig?.pitch || pitch || 1.0;
    const personaRate = (persona?.voiceConfig?.rate || 1.0) * (rate || 1.0);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.pitch = personaPitch;
    utterance.rate = Math.max(0.7, Math.min(1.4, personaRate));

    this.currentSpeechId = speechId || Date.now().toString();

    // IMPORTANT: Keep utterance reference in window to avoid Chrome GC bug
    if (typeof window !== 'undefined') {
      window._activeSpeechUtterance = utterance;
    }
    this.currentUtterance = utterance;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentSpeechId = null;
      this.currentUtterance = null;
      if (typeof window !== 'undefined') {
        window._activeSpeechUtterance = null;
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      // Ignore 'interrupted' or 'canceled' errors when user stops playback
      if (e.error === 'interrupted' || e.error === 'canceled') {
        this.currentSpeechId = null;
        this.currentUtterance = null;
        if (onEnd) onEnd();
        return;
      }
      console.warn('Speech synthesis utterance error:', e);
      this.currentSpeechId = null;
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    // Speak
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Error invoking synth.speak:', err);
      if (onError) onError(err);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.error('Error canceling speech:', e);
      }
    }
    this.currentSpeechId = null;
    this.currentUtterance = null;
    if (typeof window !== 'undefined') {
      window._activeSpeechUtterance = null;
    }
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  getCurrentSpeechId() {
    return this.currentSpeechId;
  }

  // Web Speech Recognition
  startListening({ onResult, onInterim, onEnd, onError, lang = 'en-US' } = {}) {
    if (!this.recognition) {
      if (onError) onError({ code: 'not-supported', message: 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح. يرجى تجربة Google Chrome أو Microsoft Edge.' });
      return false;
    }

    this.manualStop = false;
    this.isListening = true;

    try {
      // Abort any ongoing recognition to cleanly reset internal state
      try {
        this.recognition.abort();
      } catch (err) {
        // ignore
      }

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript && onInterim) {
          onInterim(interimTranscript);
        }

        if (finalTranscript && onResult) {
          onResult(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // In continuous mode, brief silences are normal while thinking - do not terminate!
          return;
        }
        this.isListening = false;
        if (onError) onError({ code: event.error, originalEvent: event });
      };

      this.recognition.onend = () => {
        // If the user hasn't explicitly clicked stop, auto-restart continuous listening so pauses don't cut them off!
        if (this.isListening && !this.manualStop) {
          try {
            this.recognition.start();
            return;
          } catch (e) {
            // fall through if browser throttles rapid restart
          }
        }
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      console.error('Error starting speech recognition:', e);
      if (onError) onError({ code: 'exception', message: e.message });
      return false;
    }
  }

  stopListening() {
    this.manualStop = true;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // MediaRecorder Fallback (HTML5 Microphone capture for Whisper)
  async startMediaRecorder({ onStart, onError } = {}) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isMediaRecording = true;
        if (onStart) onStart();
      };

      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Error accessing microphone for recording:', err);
      if (onError) onError(err);
      return false;
    }
  }

  stopMediaRecorder() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isMediaRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        this.isMediaRecording = false;
        
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Transcribe audio blob using Groq Whisper
  async transcribeWithGroq(audioBlob, apiKey) {
    if (!apiKey) {
      throw new Error('NO_GROQ_KEY');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'speech.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Whisper HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.text ? data.text.trim() : '';
  }
}

export const speechService = new SpeechService();
