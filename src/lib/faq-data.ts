export interface FaqItem {
  category: string
  question: string
  answer: string
  keywords: string[]
}

export const FAQ_CATEGORIES = [
  "Getting Started",
  "How Intenteo Works",
  "Purpose, Vision & Goals",
  "Tasks & Planning",
  "Habits & Trackers",
  "Journal & Reflection",
  "Intent Score",
  "Account & Privacy",
  "App & Downloads",
] as const

export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export const faqData: FaqItem[] = [
  // ─── Getting Started ───
  {
    category: "Getting Started",
    question: "What is Intenteo?",
    answer: "Intenteo is an intentional living platform that connects your purpose, vision, goals, tasks, habits, and reflection into a single system. It helps you move from what matters to what you do every day, so your actions align with the life you want to live.",
    keywords: ["what", "intenteo", "platform", "app", "product"],
  },
  {
    category: "Getting Started",
    question: "Who is Intenteo for?",
    answer: "Intenteo is for anyone who wants to live with more intention — people who want to get clear about what matters, turn their values into meaningful goals, organize their days around priorities, and build habits that support who they want to become.",
    keywords: ["who", "for", "people", "users", "audience"],
  },
  {
    category: "Getting Started",
    question: "How do I get started?",
    answer: "Create a free account, set your purpose, and start building your first vision. Intenteo guides you through each step — from defining your purpose to setting goals, creating tasks, and building habits. You can be up and running in minutes.",
    keywords: ["start", "begin", "sign up", "onboard", "first"],
  },
  {
    category: "Getting Started",
    question: "Do I need an account to use Intenteo?",
    answer: "Yes, you need a free account to use Intenteo. Your account lets us save your data and sync it across your devices. Creating an account takes just a minute.",
    keywords: ["account", "sign up", "register", "need"],
  },
  {
    category: "Getting Started",
    question: "Is Intenteo available on mobile?",
    answer: "Yes. Intenteo is available as a mobile app for iOS and Android. You can also use Intenteo directly from your web browser on any device.",
    keywords: ["mobile", "ios", "android", "phone", "app"],
  },

  // ─── How Intenteo Works ───
  {
    category: "How Intenteo Works",
    question: "How does Intenteo connect purpose to daily actions?",
    answer: "Intenteo uses a layered framework: Purpose \u2192 Vision \u2192 Goals \u2192 Tasks \u2192 Habits \u2192 Reflection. Each layer informs the next. Your purpose shapes your vision, your vision drives your goals, your goals determine your daily tasks, your habits build consistency, and your reflections help you learn and grow.",
    keywords: ["connect", "purpose", "daily", "actions", "framework"],
  },
  {
    category: "How Intenteo Works",
    question: "What makes Intenteo different from a traditional productivity app?",
    answer: "Traditional productivity apps focus on task completion. Intenteo connects every action back to your purpose and vision. It\u2019s not about doing more \u2014 it\u2019s about doing what matters. The Intent Score measures how intentionally you lived, not just how much you accomplished.",
    keywords: ["different", "unique", "special", "compare", "productivity"],
  },
  {
    category: "How Intenteo Works",
    question: "What is the Intenteo framework?",
    answer: "The Intenteo framework is a six-stage system: Purpose, Vision, Goals, Tasks, Habits, and Reflection. It moves from your deepest values to your daily actions, creating a connected system for intentional living. Each stage builds on the previous one.",
    keywords: ["framework", "system", "stages", "layers"],
  },
  {
    category: "How Intenteo Works",
    question: "How do the different parts of Intenteo work together?",
    answer: "Everything in Intenteo is connected. Your purpose informs your visions, your visions drive your goals, your goals shape your tasks and habits, and your reflections feed back into your understanding. The Intent Score ties it all together into a single daily measure.",
    keywords: ["together", "connected", "parts", "integrate", "work"],
  },

  // ─── Purpose, Vision & Goals ───
  {
    category: "Purpose, Vision & Goals",
    question: "What is Purpose in Intenteo?",
    answer: "Your purpose is the guiding principle behind everything you do. It\u2019s the answer to why you exist and what matters most to you. In Intenteo, your purpose serves as the foundation for all your visions, goals, and actions.",
    keywords: ["purpose", "why", "meaning", "principle"],
  },
  {
    category: "Purpose, Vision & Goals",
    question: "What is a Vision?",
    answer: "A vision is a concrete picture of the future you want to build. It translates your abstract values and dreams into a tangible direction. You can set timeframes, add imagery, and link your visions to the life areas they impact.",
    keywords: ["vision", "future", "picture", "dream", "direction"],
  },
  {
    category: "Purpose, Vision & Goals",
    question: "How do Goals connect to my Vision?",
    answer: "Goals are the measurable milestones that move you toward your vision. Each goal you set in Intenteo can be linked to one or more visions, so you always know which bigger picture you\u2019re working toward.",
    keywords: ["goals", "connect", "vision", "milestones", "link"],
  },
  {
    category: "Purpose, Vision & Goals",
    question: "Can I change my goals later?",
    answer: "Absolutely. Goals in Intenteo are flexible. You can update, edit, reprioritize, or archive goals at any time. Your journey evolves, and Intenteo is designed to evolve with it.",
    keywords: ["change", "edit", "update", "modify", "goals"],
  },

  // ─── Tasks & Planning ───
  {
    category: "Tasks & Planning",
    question: "How do tasks work?",
    answer: "Tasks are the specific actions you take each day. In Intenteo, tasks can be linked to your goals, so every action connects to something bigger. You can set due dates, priorities, and track completion.",
    keywords: ["tasks", "work", "actions", "daily", "do"],
  },
  {
    category: "Tasks & Planning",
    question: "Can I prioritize tasks?",
    answer: "Yes. You can set priorities on your tasks to focus on what matters most each day. Intenteo helps you surface the most important actions so you can spend your energy wisely.",
    keywords: ["prioritize", "priority", "focus", "important"],
  },
  {
    category: "Tasks & Planning",
    question: "Can tasks be connected to goals?",
    answer: "Yes. Every task can be linked to one or more goals. This connection is what makes Intenteo different \u2014 you always know why you\u2019re doing something and how it contributes to your bigger picture.",
    keywords: ["tasks", "connected", "goals", "link"],
  },
  {
    category: "Tasks & Planning",
    question: "Can I plan my day?",
    answer: "Yes. Intenteo helps you plan your day by surfacing tasks linked to your goals, showing your habit commitments, and calculating your daily Intent Score. You start each day with clarity on what matters.",
    keywords: ["plan", "day", "daily", "schedule", "organize"],
  },

  // ─── Habits & Trackers ───
  {
    category: "Habits & Trackers",
    question: "How do habits work?",
    answer: "Habits in Intenteo are recurring actions that build consistency. You can set schedules (daily, weekly, custom), track streaks, monitor health, and see trends over time. Habits are linked to your goals and contribute to your Intent Score.",
    keywords: ["habits", "work", "streaks", "routine", "consistent"],
  },
  {
    category: "Habits & Trackers",
    question: "Can I create custom habits?",
    answer: "Yes. You can create any habit that supports your goals and lifestyle. Intenteo provides templates and suggestions, but you have full flexibility to define habits that matter to you.",
    keywords: ["custom", "create", "habit", "new", "own"],
  },
  {
    category: "Habits & Trackers",
    question: "What are trackers?",
    answer: "Trackers let you monitor specific metrics over time \u2014 things like water intake, sleep quality, mood, or any custom metric you want to measure. They give you visibility into patterns and trends.",
    keywords: ["trackers", "track", "metrics", "monitor", "measure"],
  },
  {
    category: "Habits & Trackers",
    question: "How are habit streaks calculated?",
    answer: "Habit streaks count consecutive completions based on your habit\u2019s schedule. If you set a daily habit and complete it every day, your streak grows. Missing a day resets the streak, but Intenteo also offers a recovery system so one miss doesn\u2019t erase your progress.",
    keywords: ["streaks", "calculate", "count", "miss", "recovery"],
  },

  // ─── Journal & Reflection ───
  {
    category: "Journal & Reflection",
    question: "What is the Journal?",
    answer: "The Journal is your space for daily reflection. You can capture thoughts, gratitude, mood, and insights about your day. Over time, it becomes a record of your growth and a source of self-awareness.",
    keywords: ["journal", "write", "diary", "log", "entry"],
  },
  {
    category: "Journal & Reflection",
    question: "How does daily reflection work?",
    answer: "At the end of each day, you can log a reflection entry with your mood, gratitude, and notes. Intenteo helps you spot patterns between your habits, mood, and goal progress \u2014 turning experience into wisdom.",
    keywords: ["reflection", "daily", "end of day", "review"],
  },
  {
    category: "Journal & Reflection",
    question: "Can I use my own journal prompts?",
    answer: "Yes. Intenteo provides built-in reflection prompts, but you can also write freely or create your own prompts. The journal adapts to your reflection style.",
    keywords: ["prompts", "custom", "own", "write", "journal"],
  },
  {
    category: "Journal & Reflection",
    question: "Can I review previous reflections?",
    answer: "Yes. Your journal history is always accessible. You can browse past entries, search for specific topics, and see how your reflections evolve over time.",
    keywords: ["review", "previous", "history", "past", "entries"],
  },

  // ─── Intent Score ───
  {
    category: "Intent Score",
    question: "What is the Intent Score?",
    answer: "The Intent Score is a daily measure of how intentionally you lived. It weighs task completion, habit consistency, goal alignment, and reflection quality into a single percentage \u2014 giving you a clear pulse on your day.",
    keywords: ["intent", "score", "what", "daily", "measure"],
  },
  {
    category: "Intent Score",
    question: "How is my Intent Score calculated?",
    answer: "Your Intent Score is calculated based on four factors: tasks completed, habits practiced, goal alignment, and whether you logged a reflection. Each factor is weighted to reflect its contribution to intentional living.",
    keywords: ["calculate", "score", "formula", "computed", "factors"],
  },
  {
    category: "Intent Score",
    question: "Is the Intent Score a productivity score?",
    answer: "Not exactly. The Intent Score measures intentionality, not productivity. You can have a high score by completing a few meaningful tasks and maintaining your habits, even if your task count is low. It\u2019s about alignment, not volume.",
    keywords: ["productivity", "measure", "score", "same", "different"],
  },
  {
    category: "Intent Score",
    question: "How can I improve my Intent Score?",
    answer: "Focus on consistency across all four areas: complete your tasks, maintain your habit streaks, align your actions with your goals, and take time to reflect. Small, consistent actions every day are the key.",
    keywords: ["improve", "increase", "better", "higher", "score"],
  },

  // ─── Account & Privacy ───
  {
    category: "Account & Privacy",
    question: "How do I create an account?",
    answer: "Visit the Intenteo website or download the app and tap Sign Up. You can create an account with your email address in just a minute.",
    keywords: ["create", "account", "sign up", "register"],
  },
  {
    category: "Account & Privacy",
    question: "How do I delete my account?",
    answer: "You can delete your account from your account settings. Upon deletion, your data will be permanently removed from our systems. Since Intenteo stores most data locally, you should also clear your browser data if desired.",
    keywords: ["delete", "account", "remove", "cancel"],
  },
  {
    category: "Account & Privacy",
    question: "How is my information handled?",
    answer: "We take your privacy seriously. Intenteo primarily stores your data in your browser\u2019s local storage, meaning your data stays on your device. We do not sell your personal information. See our Privacy Policy for full details.",
    keywords: ["privacy", "data", "information", "handle", "protect"],
  },
  {
    category: "Account & Privacy",
    question: "Where can I read the Privacy Policy?",
    answer: "You can read our full Privacy Policy at /privacy. It explains how we collect, use, store, and protect your information.",
    keywords: ["privacy", "policy", "read", "where"],
  },

  // ─── App & Downloads ───
  {
    category: "App & Downloads",
    question: "Where can I download the Intenteo app?",
    answer: "You can download Intenteo from the App Store (iOS) or Google Play (Android). You can also use Intenteo directly from your web browser at intenteo.app.",
    keywords: ["download", "app store", "google play", "where"],
  },
  {
    category: "App & Downloads",
    question: "Is there a web version?",
    answer: "Yes. Intenteo is available as a web application that works in any modern browser. You can access it from your desktop, tablet, or phone.",
    keywords: ["web", "browser", "version", "desktop", "online"],
  },
  {
    category: "App & Downloads",
    question: "Is Intenteo available on Android?",
    answer: "Yes. Intenteo is available for download on Google Play for Android devices.",
    keywords: ["android", "google play", "available", "mobile"],
  },
  {
    category: "App & Downloads",
    question: "Will Intenteo be available on other platforms?",
    answer: "We\u2019re actively working on expanding platform support. Currently available on iOS, Android, and web. Stay tuned for updates on additional platforms.",
    keywords: ["other", "platforms", "windows", "mac", "future"],
  },
]

export function searchFaq(items: FaqItem[], query: string): FaqItem[] {
  if (!query.trim()) return items
  const lower = query.toLowerCase()
  const terms = lower.split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    const searchable = `${item.question} ${item.answer} ${item.category} ${item.keywords.join(" ")}`.toLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}
