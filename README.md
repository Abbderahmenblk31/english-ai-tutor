# Fluently AI - Intelligent English Conversation Tutor & Real-Time Corrector 🎓

An unlimited, intelligent, real-time AI English tutor designed for daily conversation practice, grammar correction, vocabulary expansion, and accent coaching.

![Fluently AI Banner](public/icons.svg)

---

## ✨ Features

- **Genuine Generative AI Conversation:**
  - Direct connection to **Google Gemini API** (`gemini-3.1-pro-preview`, `gemini-3.8-flash`, `gemini-2.5-flash`, etc.) with dynamic model discovery and automatic multi-tier failover.
  - Multi-provider flexibility: Google Gemini (Free), Groq (Llama 3.3 70B), Local Ollama, and OpenAI.
  - Never uses canned or repetitive mock templates.

- **Real-Time Grammar Correction & Native Phrasing:**
  - Instant grammatical error detection with side-by-side diffs.
  - Explanations in **Arabic** and **English** for every grammar rule.
  - *"Like a Native"* idiomatic alternatives for natural fluency.
  - CEFR Language Level estimation (A1 through C2).

- **Continuous Voice Speech-to-Text (STT):**
  - Continuous speech dictation without premature cutoffs (`continuous = true`).
  - Speak, pause, and think freely at your own pace without interruption.
  - Direct audio recording fallback with Whisper support.

- **Persona-Specific Speech Synthesis (TTS):**
  - Distinct voice profiling, accent adaptation (US 🇺🇸 / UK 🇬🇧), and pitch/speed modulation.
  - Anti-looping and Chromium garbage collection freeze protection.

- **5 Distinct AI Tutor Personas:**
  - 🇺🇸 **Emma:** Friendly American Conversation Partner
  - 🇬🇧 **Prof. Arthur:** Strict British Grammar & Academic Specialist
  - 🎯 **Sarah:** Certified IELTS & TOEFL Speaking Examiner
  - 💼 **David:** Executive Business English & Interview Coach
  - 🌍 **Nour:** Bilingual Arabic/English Mentor for smooth learning

- **Interactive Vocabulary Vault & Flashcards:**
  - Save vocabulary words directly from the conversation.
  - Interactive quiz mode with flashcard flips and pronunciation practice.

- **Productivity & Navigation:**
  - One-click clear conversation with safety confirmation.
  - Floating smooth scroll-to-top and jump-to-bottom buttons.
  - Daily streaks, habit tracking, and celebratory confetti upon reaching daily practice goals.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/Abbderahmenblk31/english-ai-tutor.git
cd english-ai-tutor
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 AI Key Setup (100% Free)
Get a free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) with zero credit card required, then paste it in the in-app activation bar.

---

## 🛠️ Built With
- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Web Speech Recognition & Synthesis API**
- **Google Generative AI (Gemini Interactions / Content Generation API)**
