export const TOPICS = [
  {
    id: 'free_chat',
    icon: 'MessageSquare',
    title: 'Free Open Conversation',
    titleAr: 'محادثة حرة مفتوحة',
    category: 'General',
    categoryAr: 'عام',
    starter: "Hey there! How has your day been so far? Tell me what you've been working on or thinking about today!",
    starterAr: "مرحباً بك! كيف سار يومك حتى الآن؟ شاركني ما قمت به أو ما تفكر فيه اليوم!",
    level: 'All Levels',
    objective: 'Practice spontaneous speaking and building conversational flow.',
    suggestedReplies: [
      {
        text: "My day has been pretty good! I spent most of my time working, and now I'm practicing my English.",
        textAr: "كان يومي جيداً جداً! قضيت معظمه في العمل، والآن أتدرب على لغتي الإنجليزية.",
        intent: "direct"
      },
      {
        text: "It was a bit busy and tiring, but I'm excited to have this conversation with you.",
        textAr: "كان يوماً حافلاً ومتعباً بعض الشيء، لكني متحمس لإجراء هذه المحادثة معك.",
        intent: "alternative"
      },
      {
        text: "Not bad at all! How about you? How has your day been going?",
        textAr: "ليس سيئاً على الإطلاق! ماذا عنك أنت؟ كيف يسير يومك؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'job_interview',
    icon: 'Briefcase',
    title: 'Job Interview Simulation',
    titleAr: 'محاكاة مقابلة عمل حقيقية',
    category: 'Career',
    categoryAr: 'العمل والمهنة',
    starter: "Welcome to our interview! To begin, could you please tell me about yourself and your background?",
    starterAr: "أهلاً بك في المقابلة! لنبدأ، هل يمكنك إخباري بنبذة عن نفسك وخلفيتك المهنية؟",
    level: 'Intermediate - Advanced',
    objective: 'Master the STAR method, highlight strengths, and answer challenging interview questions.',
    suggestedReplies: [
      {
        text: "Sure! I have a background in software and technology, and I've been focusing on building practical applications.",
        textAr: "بالتأكيد! لدي خلفية في البرمجيات والتكنولوجيا، وكنت أركز على بناء تطبيقات عملية.",
        intent: "direct"
      },
      {
        text: "I am a motivated professional who loves solving complex challenges and collaborating in dynamic teams.",
        textAr: "أنا شخص محفز وشغوف بحل التحديات المعقدة والتعاون ضمن فرق عمل تفاعلية.",
        intent: "alternative"
      },
      {
        text: "Could you tell me a little bit more about what this role focuses on day-to-day?",
        textAr: "هل يمكنك إخباري أكثر عما تركز عليه هذه الوظيفة بشكل يومي؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'ielts_speaking',
    icon: 'GraduationCap',
    title: 'IELTS Speaking Part 2 & 3',
    titleAr: 'اختبار الآيلتس المحادثة',
    category: 'Exams',
    categoryAr: 'اختبارات',
    starter: "This is Part 2 of your IELTS Speaking test. Describe a challenge you overcame recently. You should say what it was, how you dealt with it, and what you learned.",
    starterAr: "هذا الجزء الثاني من اختبار الآيلتس: تحدث عن تحدٍ واجهته وتغلبت عليه مؤخراً، وماذا تعلمت منه.",
    level: 'B1 - C2',
    objective: 'Expand speech duration, use complex structures, and receive band score feedback.',
    suggestedReplies: [
      {
        text: "A significant challenge I faced recently was learning a completely new technical skill under a tight deadline.",
        textAr: "تحدٍ كبير واجهته مؤخراً كان تعلم مهارة تقنية جديدة كلياً في وقت ضيق ومحدد.",
        intent: "direct"
      },
      {
        text: "I recently had to organize a complex project while managing unexpected obstacles, which taught me great adaptability.",
        textAr: "اضطررت مؤخراً لتنظيم مشروع معقد أثناء التعامل مع عقبات غير متوقعة، مما علمني المرونة العالية.",
        intent: "alternative"
      },
      {
        text: "Could I take about 30 seconds to gather my thoughts before presenting my full answer?",
        textAr: "هل يمكنني أخذ حوالي 30 ثانية لترتيب أفكاري قبل تقديم إجابتي الكاملة؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'coffee_shop',
    icon: 'Coffee',
    title: 'At the Cafe & Ordering',
    titleAr: 'في المقهى وطلب القهوة',
    category: 'Daily Life',
    categoryAr: 'الحياة اليومية',
    starter: "Hi! Welcome to Artisan Coffee Roasters. What can I get started for you today?",
    starterAr: "مرحباً! أهلاً بك في المقهى. ماذا تحب أن تطلب اليوم؟",
    level: 'Beginner - Intermediate',
    objective: 'Practice polite ordering, customizing food/drinks, and small talk.',
    suggestedReplies: [
      {
        text: "Hi! Could I please get a medium cappuccino with oat milk, and a little bit of sugar?",
        textAr: "مرحباً! هل يمكنني الحصول على كابتشينو متوسط بحليب الشوفان وقليل من السكر من فضلك؟",
        intent: "direct"
      },
      {
        text: "Hello! I'd like an iced Americano and one chocolate croissant to go, please.",
        textAr: "مرحباً! أود أمريكانو مثلج وكرواسون بالشوكولاتة سفري، لو سمحت.",
        intent: "alternative"
      },
      {
        text: "What specialty roast or seasonal drink do you recommend today?",
        textAr: "ما هو المحصول الخاص أو المشروب الموسمي الذي تنصح به اليوم؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'travel_airport',
    icon: 'Plane',
    title: 'Airport Check-in & Border Control',
    titleAr: 'في المطار وإجراءات السفر والجوازات',
    category: 'Travel',
    categoryAr: 'السفر والسياحة',
    starter: "Good afternoon, passport and boarding pass please. What is the purpose of your visit, and how long do you intend to stay?",
    starterAr: "مساء الخير، جواز السفر وتذكرة الصعود من فضلك. ما هو سبب زيارتك وما هي مدة إقامتك؟",
    level: 'Beginner - Intermediate',
    objective: 'Learn travel vocabulary, answering official questions clearly.',
    suggestedReplies: [
      {
        text: "Good afternoon, here they are. I am visiting for tourism and leisure, and I plan to stay for two weeks.",
        textAr: "مساء الخير، تفضل ها هما. أنا هنا لغرض السياحة والاستجمام، وأخطط للبقاء لمدة أسبوعين.",
        intent: "direct"
      },
      {
        text: "Here is my passport. I'm here to attend a business conference for five days, staying at the downtown hotel.",
        textAr: "تفضل جواز سفري. أنا هنا لحضور مؤتمر أعمال لمدة خمسة أيام، وسأقيم في فندق وسط المدينة.",
        intent: "alternative"
      },
      {
        text: "Do you also need to see my return ticket and hotel reservation confirmation?",
        textAr: "هل تحتاج أيضاً لرؤية تذكرة العودة وتأكيد حجز الفندق؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'tech_debate',
    icon: 'Cpu',
    title: 'Tech & AI Future Debate',
    titleAr: 'نقاش تقني: الذكاء الاصطناعي والمستقبل',
    category: 'Debate',
    categoryAr: 'حوار ونقاش',
    starter: "Do you believe Artificial Intelligence will create more opportunities for humans, or will it eliminate essential human skills? I'd love to hear your perspective!",
    starterAr: "هل تعتقد أن الذكاء الاصطناعي سيخلق فرصاً أكثر للبشر أم سيلغي مهارات إنسانية جوهرية؟ شاركني رأيك!",
    level: 'Intermediate - Advanced',
    objective: 'Argue viewpoints, use transitional linking words, express opinions and counterarguments.',
    suggestedReplies: [
      {
        text: "I believe AI will augment human abilities rather than replace them, opening new creative fields.",
        textAr: "أعتقد أن الذكاء الاصطناعي سيعزز قدرات البشر بدلاً من استبدالها، وسيفتح مجالات إبداعية جديدة.",
        intent: "direct"
      },
      {
        text: "While it boosts efficiency, there is a real risk that humans might become overly dependent on automated systems.",
        textAr: "رغم أنه يزيد الكفاءة، إلا أن هناك خطراً حقيقياً في أن يصبح البشر معتمدين بشكل مفرط على الأنظمة الآلية.",
        intent: "alternative"
      },
      {
        text: "That is a fascinating dilemma. Which industries do you think will feel the biggest shift first?",
        textAr: "هذه معضلة شيقة للغاية. ما هي القطاعات التي تعتقد أنها ستشهد التحول الأكبر أولاً؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'doctor_visit',
    icon: 'Stethoscope',
    title: "At the Doctor's Clinic",
    titleAr: 'زيارة الطبيب وشرح الأعراض',
    category: 'Health',
    categoryAr: 'الصحة',
    starter: "Hello, come in and take a seat. What seems to be the problem today? How long have you been feeling this way?",
    starterAr: "مرحباً، تفضل بالجلوس. مم تشتكي اليوم؟ ومنذ متى وأنت تشعر بهذه الأعراض؟",
    level: 'Intermediate',
    objective: 'Describe physical symptoms, pain levels, and understand medical advice.',
    suggestedReplies: [
      {
        text: "Hello doctor, I've had a sore throat, a persistent cough, and a mild fever for the past three days.",
        textAr: "مرحباً دكتور، أعاني من التهاب في الحلق وسعال مستمر وحمى خفيفة منذ ثلاثة أيام.",
        intent: "direct"
      },
      {
        text: "I've been feeling unusually exhausted and experiencing frequent headaches whenever I focus on screens.",
        textAr: "أشعر بإرهاق غير معتاد وصداع متكرر كلما ركزت أمام الشاشات.",
        intent: "alternative"
      },
      {
        text: "Should I take any specific tests or blood work to find out what is causing this?",
        textAr: "هل تنصح بإجراء تحاليل معينة أو فحص دم لمعرفة السبب بدقة؟",
        intent: "clarify"
      }
    ]
  },
  {
    id: 'storytelling',
    icon: 'BookOpen',
    title: 'Storytelling & Past Tenses',
    titleAr: 'سرد قصة وممارسة أزمنة الماضي',
    category: 'Grammar Focus',
    categoryAr: 'تركيز قواعدي',
    starter: "Let's practice narrative tenses! Tell me about the most memorable or funny situation that happened to you in the past year.",
    starterAr: "لنتدرب على سرد الأحداث بصيغ الماضي! أخبرني عن موقف طريف أو لا ينسى حدث لك في العام الماضي.",
    level: 'All Levels',
    objective: 'Master past simple, past continuous, and past perfect seamlessly.',
    suggestedReplies: [
      {
        text: "Last summer, while I was traveling with my friends, we took the wrong train and ended up in a picturesque little village.",
        textAr: "في الصيف الماضي، بينما كنت مسافراً مع أصدقائي، ركبنا القطار الخطأ وانتهى بنا الأمر في قرية صغيرة ساحرة.",
        intent: "direct"
      },
      {
        text: "A funny incident happened at work when I accidentally presented the wrong slide during a serious team meeting.",
        textAr: "حدث موقف طريف في العمل عندما عرضت بالخطأ الشريحة الخاطئة أثناء اجتماع رسمي للفريق.",
        intent: "alternative"
      },
      {
        text: "Let me think for a second. Do you prefer a funny travel anecdote or an interesting work story?",
        textAr: "دعني أفكر لثانية. هل تفضل قصة طريفة عن السفر أم قصة مثيرة للاهتمام في العمل؟",
        intent: "clarify"
      }
    ]
  }
];
