// High-Precision Conversational AI Service
// Directly connects to Google Gemini Multi-Model Cluster with Dynamic Model Discovery
// Supports: Dynamic Google /v1beta/models querying & Automatic Failover Chain

const SYSTEM_INSTRUCTION_BASE = `You are a world-class AI English Tutor, Conversation Partner, and Grammar Specialist.
Your mission is to converse naturally with the student in English, keep the dialogue engaging, and simultaneously analyze their message to detect grammatical errors, awkward phrasing, and vocabulary improvements.

CRITICAL INSTRUCTION:
You MUST ALWAYS respond with a VALID JSON object matching the following structure ONLY:
{
  "reply": "Your engaging, contextual conversational response in English. Respond directly and specifically to what the student just said. Ask a thoughtful follow-up question to keep the chat moving. Never repeat canned generic phrases.",
  "replyAr": "الترجمة العربية الدقيقة والمبسطة لردك بالكامل أعلاه، لمساعدة الطالب على الفهم الكامل والدقيق لكل كلمة وسياق.",
  "suggestedReplies": [
    {
      "text": "Natural, complete English response sentence the student could choose to answer or continue the topic.",
      "textAr": "الترجمة العربية الواضحة لهذا الرد المقترح لمساعدة الطالب في حال نسيان الكلمات أو التردد في الإجابة.",
      "intent": "direct" // "direct" | "alternative" | "clarify"
    },
    {
      "text": "An alternative natural response exploring a different personal thought, experience, or opinion.",
      "textAr": "الترجمة العربية للاقتراح الثاني للمواصلة.",
      "intent": "alternative"
    },
    {
      "text": "A polite follow-up question back to you (the tutor) or asking for explanation (e.g. Could you explain what you meant by... / What is your take on that?)",
      "textAr": "صيغة سؤال ذكية للمواصلة في حال لم يفهم الطالب السؤال أو لم يجد إجابة محددة.",
      "intent": "clarify"
    }
  ],
  "hasMistakes": true, // or false if user message was grammatically flawless
  "corrections": [
    {
      "original": "exact segment with error",
      "corrected": "grammatically correct replacement",
      "explanation": "concise English explanation of the grammar rule",
      "explanationAr": "شرح مبسط وواضح باللغة العربية لسبب الخطأ والقاعدة النحوية الصحيحة",
      "type": "grammar" // "grammar" | "vocabulary" | "spelling" | "punctuation"
    }
  ],
  "nativeAlternative": "How an educated native English speaker would phrase the same thought naturally and idiomatically.",
  "nativeAlternativeAr": "ترجمة وتوضيح باللغة العربية للصياغة الطبيعية للمتحدث الأصلي.",
  "vocabularyBoost": [
    {
      "word": "useful word/idiom related to this specific conversation turn",
      "meaning": "Clear English definition",
      "meaningAr": "المعنى باللغة العربية",
      "example": "A natural example sentence using this word."
    }
  ],
  "fluencyScore": 92, // An integer between 50 and 100 evaluating the grammatical fluency, confidence, and natural flow of the user's input
  "fluencyFeedback": "Great natural rhythm! Good vocabulary selection.",
  "fluencyFeedbackAr": "طلاقة ممتازة وتركيب جمل سليم مع تسلسل أفكار سلس ومترابط.",
  "pronunciationTips": [
    {
      "word": "word that non-native speakers often mispronounce",
      "tip": "Phonetic spelling and pronunciation advice"
    }
  ],
  "cefrLevel": "B1" // Estimated level: A1, A2, B1, B2, C1, or C2
}

Ensure the output is strictly valid JSON with no markdown formatting or preambles.`;

export const DEPRECATED_GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-1.0-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest'
];

export const GEMINI_MODEL_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-1.5-pro',
  'gemini-3.1-pro-preview',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash-8b'
];

/**
 * Pings a single Gemini model to test its responsiveness
 */
async function pingGeminiModel(apiKey, modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Respond with OK' }] }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  return true;
}

/**
 * Dynamically queries Google's /v1beta/models endpoint to find the exact live models for this API key,
 * then validates the best responsive candidate.
 */
export async function testGeminiKey(apiKey, preferredModel = 'gemini-3.1-pro-preview') {
  if (!apiKey || !apiKey.trim()) throw new Error('يرجى إدخال المفتاح أولاً');
  const cleanKey = apiKey.trim();

  // 1. Fetch available models from Google API dynamically
  let discoveredModels = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.models)) {
        discoveredModels = listData.models
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
      }
    } else {
      const errData = await listRes.json().catch(() => ({}));
      if (errData.error?.message?.includes('API_KEY_INVALID') || errData.error?.message?.includes('not valid')) {
        throw new Error('مفتاح الـ API غير صالح. يرجى التأكد من نسخه بدقة من Google AI Studio.');
      }
    }
  } catch (err) {
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('غير صالح')) {
      throw err;
    }
    console.warn('Could not query models list, using static candidate pool:', err);
  }

  // 2. Build candidate queue: Preferred -> Discovered matching Priority -> Discovered -> Priority
  const queue = [
    preferredModel,
    ...GEMINI_MODEL_PRIORITY.filter(m => discoveredModels.includes(m)),
    ...discoveredModels,
    ...GEMINI_MODEL_PRIORITY
  ].filter((m, i, arr) => 
    Boolean(m) &&
    arr.indexOf(m) === i && 
    !DEPRECATED_GEMINI_MODELS.includes(m)
  );

  let lastError = null;

  for (const candidate of queue) {
    try {
      const ok = await pingGeminiModel(cleanKey, candidate);
      if (ok) {
        console.log(`Successfully verified Gemini model: ${candidate}`);
        return { success: true, workingModel: candidate };
      }
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      console.warn(`Model ${candidate} unavailable (${msg}), trying next...`);

      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        throw new Error('مفتاح الـ API غير صالح. يرجى التأكد من نسخه بدقة من Google AI Studio.');
      }

      // If high demand or deprecated, try next model in queue
      continue;
    }
  }

  throw lastError || new Error('تعذر العثور على نموذج مستجيب حالياً. يرجى المحاولة بعد لحظات.');
}

/**
 * Sanitize and format message history for Google Gemini API:
 * 1. Filter out leading assistant/model greeting (Gemini requires first content to be 'user').
 * 2. Enforce alternating roles: user -> model -> user -> model.
 * 3. Merge adjacent messages with the same role.
 */
function formatMessagesForGemini(messages) {
  const contents = [];

  for (const msg of messages) {
    const role = msg.role === 'user' ? 'user' : 'model';

    // Gemini rejects conversations starting with 'model'
    if (contents.length === 0 && role === 'model') {
      continue;
    }

    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text += `\n${msg.content}`;
    } else {
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }
  }

  // If no user messages were found, provide fallback
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Hello! I am ready to practice English.' }]
    });
  }

  return contents;
}

// Master Dispatcher
export async function sendMessageToAI({
  messages,
  persona,
  topic,
  settings,
}) {
  const {
    provider,
    geminiKey,
    groqKey,
    ollamaUrl,
    ollamaModel,
    openaiKey,
    openaiModel,
    geminiModel,
    groqModel,
    explanationLang
  } = settings;

  const personaInstruction = persona?.systemPrompt || "You are an encouraging English conversation tutor.";
  const topicInstruction = topic?.objective ? `Current Scenario / Topic: ${topic.title}. Objective: ${topic.objective}` : "General everyday English practice.";
  const langPref = explanationLang === 'ar' ? "Provide all explanations and meanings in Arabic where designated (explanationAr, meaningAr, nativeAlternativeAr)." : "Provide explanations in English.";

  const fullSystemPrompt = `${SYSTEM_INSTRUCTION_BASE}

[Tutor Persona]: ${personaInstruction}
[Session Topic]: ${topicInstruction}
[Language Note]: ${langPref}
[Student Level]: ${settings.userLevel || 'Intermediate'}`;

  // 1. If Gemini key is provided (Recommended default with multi-model failover)
  if (geminiKey && geminiKey.trim()) {
    try {
      const res = await callGeminiAPI({
        apiKey: geminiKey.trim(),
        model: geminiModel || 'gemini-3.1-pro-preview',
        systemPrompt: fullSystemPrompt,
        messages
      });
      res.engineType = `Gemini (${res.usedModel || 'Pro'}) (Real AI)`;
      return res;
    } catch (e) {
      console.error("Gemini API call failed:", e);
      throw new Error(`خطأ في الاتصال بـ Gemini API: ${e.message}`);
    }
  }

  // 2. If Groq key is provided
  if (groqKey && groqKey.trim()) {
    try {
      const res = await callGroqAPI({
        apiKey: groqKey.trim(),
        model: groqModel || 'llama-3.3-70b-versatile',
        systemPrompt: fullSystemPrompt,
        messages
      });
      res.engineType = `Groq (Llama 3.3 70B)`;
      return res;
    } catch (e) {
      console.error("Groq API call failed:", e);
      throw new Error(`خطأ في الاتصال بـ Groq API: ${e.message}`);
    }
  }

  // 3. If OpenAI key is provided
  if (openaiKey && openaiKey.trim()) {
    try {
      const res = await callOpenAIAPI({
        apiKey: openaiKey.trim(),
        model: openaiModel || 'gpt-4o-mini',
        systemPrompt: fullSystemPrompt,
        messages
      });
      res.engineType = `OpenAI (${openaiModel || 'gpt-4o-mini'})`;
      return res;
    } catch (e) {
      console.error("OpenAI call failed:", e);
      throw new Error(`خطأ في الاتصال بـ OpenAI API: ${e.message}`);
    }
  }

  // 4. If Ollama local is selected
  if (provider === 'ollama') {
    try {
      const res = await callOllamaAPI({
        url: ollamaUrl || 'http://localhost:11434',
        model: ollamaModel || 'llama3:latest',
        systemPrompt: fullSystemPrompt,
        messages
      });
      res.engineType = `Ollama Local (${ollamaModel || 'llama3'})`;
      return res;
    } catch (e) {
      console.error("Ollama call failed:", e);
      throw new Error(`تعذر الاتصال ببرنامج Ollama المحلي (${e.message}). تأكد من تشغيل Ollama.`);
    }
  }

  // 5. NO API KEY CONFIGURED
  return {
    reply: "Welcome! To converse with me using real, unrestricted Gemini AI (without canned responses), please paste your free Google Gemini API key in the activation box above! It's 100% free with no credit card required.",
    replyAr: "مرحباً بك! للمحادثة معي بذكاء اصطناعي حقيقي غير محدود ودون تكرار، يرجى لصق مفتاح Google Gemini المجاني في الصندوق بالأعلى! إنه مجاني 100% وبدون بطاقة بنكية.",
    suggestedReplies: [
      {
        text: "How do I get my free Google Gemini API key?",
        textAr: "كيف أحصل على مفتاح Gemini المجاني الخاص بي؟",
        intent: "clarify"
      },
      {
        text: "I want to practice my everyday conversational English.",
        textAr: "أريد ممارسة التحدث باللغة الإنجليزية اليومية.",
        intent: "direct"
      },
      {
        text: "Could you tell me what topics we can practice today?",
        textAr: "هل يمكنك إخباري بالمواضيع التي يمكننا التدرب عليها اليوم؟",
        intent: "alternative"
      }
    ],
    hasMistakes: false,
    corrections: [],
    nativeAlternative: "Welcome aboard! Let's get your AI tutor activated.",
    nativeAlternativeAr: "مرحباً بك! قم بتفعيل مفتاح Gemini المجاني في الأعلى للبدء فوراً.",
    vocabularyBoost: [],
    pronunciationTips: [],
    cefrLevel: "A1",
    needsApiKey: true
  };
}

// Call Google Gemini API with dynamic model failover & discovery
async function callGeminiAPI({ apiKey, model, systemPrompt, messages }) {
  // 1. Try to discover live models for this key dynamically from Google API
  let activeModels = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.models)) {
        activeModels = listData.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''))
          .filter(m => !DEPRECATED_GEMINI_MODELS.includes(m));
      }
    }
  } catch (e) {
    console.warn('Could not query dynamic models list:', e);
  }

  // 2. Build prioritized candidate queue (prioritize verified 2.5-flash and 1.5-flash)
  const queue = [
    model,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    ...activeModels,
    ...GEMINI_MODEL_PRIORITY
  ].filter((m, i, arr) => 
    Boolean(m) &&
    arr.indexOf(m) === i && 
    !DEPRECATED_GEMINI_MODELS.includes(m)
  );

  const contents = formatMessagesForGemini(messages);
  let lastError = null;

  for (const currentModel of queue) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status}`;

        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
          throw new Error('مفتاح الـ API غير صالح. يرجى التأكد من نسخه بدقة من Google AI Studio.');
        }

        console.warn(`Model ${currentModel} error (${errMsg}). Falling back to next candidate...`);
        lastError = new Error(errMsg);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.warn(`Model ${currentModel} returned empty text. Trying next model...`);
        continue;
      }

      const parsed = parseJsonResponse(rawText);
      parsed.usedModel = currentModel;
      return parsed;
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        throw err;
      }
      console.warn(`Model ${currentModel} execution error:`, err);
      continue;
    }
  }

  throw new Error(`تعذر الاتصال بنماذج Gemini (${lastError?.message || 'يرجى التحقق من اتصالك بالإنترنت وصلاحية المفتاح'}).`);
}

// Call Groq API
async function callGroqAPI({ apiKey, model, systemPrompt, messages }) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: groqMessages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  return parseJsonResponse(rawText);
}

// Call Ollama API
async function callOllamaAPI({ url, model, systemPrompt, messages }) {
  const targetUrl = `${url.replace(/\/+$/, '')}/api/chat`;

  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3:latest',
      messages: ollamaMessages,
      format: 'json',
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with HTTP ${response.status}`);
  }

  const data = await response.json();
  return parseJsonResponse(data.message?.content);
}

// Call OpenAI API
async function callOpenAIAPI({ apiKey, model, systemPrompt, messages }) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return parseJsonResponse(data.choices?.[0]?.message?.content);
}

// Parse JSON safely
function parseJsonResponse(rawText) {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(clean);
    if (!parsed.replyAr) {
      parsed.replyAr = '';
    }
    if (!Array.isArray(parsed.suggestedReplies)) {
      parsed.suggestedReplies = [];
    }
    if (typeof parsed.fluencyScore !== 'number') {
      parsed.fluencyScore = parsed.hasMistakes ? (parsed.corrections?.length > 2 ? 74 : 86) : 95;
    }
    if (!parsed.fluencyFeedback) {
      parsed.fluencyFeedback = parsed.hasMistakes
        ? "Good attempt! Review the grammar corrections to improve natural flow."
        : "Excellent fluency! Your sentence is smooth and well-structured.";
      parsed.fluencyFeedbackAr = parsed.hasMistakes
        ? "محاولة جيدة! راجع الملاحظات النحوية لتحسين انسيابية الجملة."
        : "طلاقة ممتازة! جملتك متناسقة وصحيحة نحوياً بنسبة عالية.";
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse JSON response:", rawText);
    return {
      reply: rawText.replace(/[{}"[\]]/g, ''),
      replyAr: '',
      suggestedReplies: [],
      hasMistakes: false,
      corrections: [],
      nativeAlternative: "",
      vocabularyBoost: [],
      pronunciationTips: [],
      cefrLevel: "B2",
      fluencyScore: 90,
      fluencyFeedback: "Conversation flowing smoothly.",
      fluencyFeedbackAr: "المحادثة تسير بسلاسة وطلاقة جيدة."
    };
  }
}

/**
 * On-demand instant translation helper:
 * Translates any English text into natural Arabic using Gemini API (or zero-key fallback)
 */
export async function translateTextToAr(text, settings = {}) {
  if (!text || !text.trim()) return '';

  const { geminiKey, geminiModel } = settings;

  // 1. Try Gemini API first if key exists
  if (geminiKey && geminiKey.trim()) {
    try {
      const queue = [geminiModel || 'gemini-3.1-pro-preview', ...GEMINI_MODEL_PRIORITY]
        .filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i && !DEPRECATED_GEMINI_MODELS.includes(m));

      const prompt = `Translate the following English conversation sentence accurately into clear, natural Arabic. Return ONLY the Arabic translation without quotes or extra words:\n\n${text}`;

      for (const model of queue) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (translated) return translated;
          }
        } catch {
          // try next model
        }
      }
    } catch (e) {
      console.warn('Gemini translate failed, trying fallback:', e);
    }
  }

  // 2. High-speed free fallback translation service (MyMemory)
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|ar`);
    if (res.ok) {
      const data = await res.json();
      if (data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (e) {
    console.warn('Free fallback translation failed:', e);
  }

  return 'تعذر إتمام الترجمة حالياً، يرجى المحاولة لاحقاً.';
}
