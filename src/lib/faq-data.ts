export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
  keywords: string[]
  relatedIds: string[]
}

export const FAQ_CATEGORIES = [
  "All",
  "Getting Started",
  "Intenteo & Intentional Living",
  "Features",
  "Intent Score",
  "Account & Privacy",
  "Mobile App",
  "Billing & Subscription",
] as const

export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export const faqData: FaqItem[] = [
  // ─── Getting Started ───
  {
    id: "what-is-intenteo",
    category: "Getting Started",
    question: "What is Intenteo?",
    answer: "Intenteo is an intentional living platform that connects your purpose, vision, goals, tasks, habits, and reflection into a single system. It helps you move from what matters to what you do every day, so your actions align with the life you want to live.",
    keywords: ["what", "intenteo", "platform", "app", "product"],
    relatedIds: ["how-does-it-work", "what-is-intent-score", "is-intenteo-free"],
  },
  {
    id: "who-is-intenteo-for",
    category: "Getting Started",
    question: "Who is Intenteo for?",
    answer: "Intenteo is for anyone who wants to live with more intention — people who want to get clear about what matters, turn their values into meaningful goals, organize their days around priorities, and build habits that support who they want to become.",
    keywords: ["who", "for", "people", "users", "audience"],
    relatedIds: ["what-is-intenteo", "how-do-i-get-started", "how-does-it-work"],
  },
  {
    id: "how-do-i-get-started",
    category: "Getting Started",
    question: "How do I get started?",
    answer: "Create a free account, set your purpose, and start building your first vision. Intenteo guides you through each step — from defining your purpose to setting goals, creating tasks, and building habits. You can be up and running in minutes.",
    keywords: ["start", "begin", "sign up", "onboard", "first"],
    relatedIds: ["do-i-need-account", "what-is-intenteo", "what-is-purpose"],
  },
  {
    id: "do-i-need-account",
    category: "Getting Started",
    question: "Do I need an account to use Intenteo?",
    answer: "Yes, you need a free account to use Intenteo. Your account lets us save your data and sync it across your devices. Creating an account takes just a minute.",
    keywords: ["account", "sign up", "register", "need"],
    relatedIds: ["how-do-i-get-started", "how-is-data-handled", "is-intenteo-free"],
  },
  {
    id: "is-intenteo-free",
    category: "Getting Started",
    question: "Is Intenteo free?",
    answer: "Yes. Intenteo is free to use with core features including purpose, vision, goals, tasks, habits, and journaling. No credit card required.",
    keywords: ["free", "pricing", "cost", "pay", "plan"],
    relatedIds: ["what-is-intenteo", "billing-and-subscription", "do-i-need-account"],
  },

  // ─── Intenteo & Intentional Living ───
  {
    id: "how-does-it-work",
    category: "Intenteo & Intentional Living",
    question: "How does Intenteo connect purpose to daily actions?",
    answer: "Intenteo uses a layered framework: Purpose → Vision → Goals → Tasks → Habits → Reflection. Each layer informs the next. Your purpose shapes your vision, your vision drives your goals, your goals determine your daily tasks, your habits build consistency, and your reflections help you learn and grow.",
    keywords: ["connect", "purpose", "daily", "actions", "framework"],
    relatedIds: ["what-is-intenteo", "what-is-framework", "how-parts-work-together"],
  },
  {
    id: "different-from-productivity",
    category: "Intenteo & Intentional Living",
    question: "What makes Intenteo different from a traditional productivity app?",
    answer: "Traditional productivity apps focus on task completion. Intenteo connects every action back to your purpose and vision. It's not about doing more — it's about doing what matters. The Intent Score measures how intentionally you lived, not just how much you accomplished.",
    keywords: ["different", "unique", "special", "compare", "productivity"],
    relatedIds: ["what-is-intent-score", "how-does-it-work", "what-is-intenteo"],
  },
  {
    id: "what-is-framework",
    category: "Intenteo & Intentional Living",
    question: "What is the Intenteo framework?",
    answer: "The Intenteo framework is a six-stage system: Purpose, Vision, Goals, Tasks, Habits, and Reflection. It moves from your deepest values to your daily actions, creating a connected system for intentional living. Each stage builds on the previous one.",
    keywords: ["framework", "system", "stages", "layers"],
    relatedIds: ["how-does-it-work", "how-parts-work-together", "what-is-purpose"],
  },
  {
    id: "how-parts-work-together",
    category: "Intenteo & Intentional Living",
    question: "How do the different parts of Intenteo work together?",
    answer: "Everything in Intenteo is connected. Your purpose informs your visions, your visions drive your goals, your goals shape your tasks and habits, and your reflections feed back into your understanding. The Intent Score ties it all together into a single daily measure.",
    keywords: ["together", "connected", "parts", "integrate", "work"],
    relatedIds: ["what-is-framework", "how-does-it-work", "what-is-intent-score"],
  },

  // ─── Features ───
  {
    id: "what-is-purpose",
    category: "Features",
    question: "What is Purpose in Intenteo?",
    answer: "Your purpose is the guiding principle behind everything you do. It's the answer to why you exist and what matters most to you. In Intenteo, your purpose serves as the foundation for all your visions, goals, and actions.",
    keywords: ["purpose", "why", "meaning", "principle"],
    relatedIds: ["what-is-vision", "how-goals-connect-to-vision", "what-is-framework"],
  },
  {
    id: "what-is-vision",
    category: "Features",
    question: "What is a Vision?",
    answer: "A vision is a concrete picture of the future you want to build. It translates your abstract values and dreams into a tangible direction. You can set timeframes, add imagery, and link your visions to the life areas they impact.",
    keywords: ["vision", "future", "picture", "dream", "direction"],
    relatedIds: ["what-is-purpose", "how-goals-connect-to-vision", "can-i-change-goals"],
  },
  {
    id: "how-goals-connect-to-vision",
    category: "Features",
    question: "How do Goals connect to my Vision?",
    answer: "Goals are the measurable milestones that move you toward your vision. Each goal you set in Intenteo can be linked to one or more visions, so you always know which bigger picture you're working toward.",
    keywords: ["goals", "connect", "vision", "milestones", "link"],
    relatedIds: ["what-is-vision", "can-i-change-goals", "can-tasks-connect-to-goals"],
  },
  {
    id: "can-i-change-goals",
    category: "Features",
    question: "Can I change my goals later?",
    answer: "Absolutely. Goals in Intenteo are flexible. You can update, edit, reprioritize, or archive goals at any time. Your journey evolves, and Intenteo is designed to evolve with it.",
    keywords: ["change", "edit", "update", "modify", "goals"],
    relatedIds: ["how-goals-connect-to-vision", "can-tasks-connect-to-goals", "how-do-habits-work"],
  },
  {
    id: "how-do-tasks-work",
    category: "Features",
    question: "How do tasks work?",
    answer: "Tasks are the specific actions you take each day. In Intenteo, tasks can be linked to your goals, so every action connects to something bigger. You can set due dates, priorities, and track completion.",
    keywords: ["tasks", "work", "actions", "daily", "do"],
    relatedIds: ["can-tasks-connect-to-goals", "can-i-prioritize-tasks", "can-i-plan-my-day"],
  },
  {
    id: "can-tasks-connect-to-goals",
    category: "Features",
    question: "Can tasks be connected to goals?",
    answer: "Yes. Every task can be linked to one or more goals. This connection is what makes Intenteo different — you always know why you're doing something and how it contributes to your bigger picture.",
    keywords: ["tasks", "connected", "goals", "link"],
    relatedIds: ["how-do-tasks-work", "how-goals-connect-to-vision", "can-i-prioritize-tasks"],
  },
  {
    id: "can-i-prioritize-tasks",
    category: "Features",
    question: "Can I prioritize tasks?",
    answer: "Yes. You can set priorities on your tasks to focus on what matters most each day. Intenteo helps you surface the most important actions so you can spend your energy wisely.",
    keywords: ["prioritize", "priority", "focus", "important"],
    relatedIds: ["how-do-tasks-work", "can-tasks-connect-to-goals", "can-i-plan-my-day"],
  },
  {
    id: "can-i-plan-my-day",
    category: "Features",
    question: "Can I plan my day?",
    answer: "Yes. Intenteo helps you plan your day by surfacing tasks linked to your goals, showing your habit commitments, and calculating your daily Intent Score. You start each day with clarity on what matters.",
    keywords: ["plan", "day", "daily", "schedule", "organize"],
    relatedIds: ["how-do-tasks-work", "can-i-prioritize-tasks", "what-is-intent-score"],
  },
  {
    id: "how-do-habits-work",
    category: "Features",
    question: "How do habits work?",
    answer: "Habits in Intenteo are recurring actions that build consistency. You can set schedules (daily, weekly, custom), track streaks, monitor health, and see trends over time. Habits are linked to your goals and contribute to your Intent Score.",
    keywords: ["habits", "work", "streaks", "routine", "consistent"],
    relatedIds: ["can-i-create-custom-habits", "how-are-streaks-calculated", "what-are-trackers"],
  },
  {
    id: "can-i-create-custom-habits",
    category: "Features",
    question: "Can I create custom habits?",
    answer: "Yes. You can create any habit that supports your goals and lifestyle. Intenteo provides templates and suggestions, but you have full flexibility to define habits that matter to you.",
    keywords: ["custom", "create", "habit", "new", "own"],
    relatedIds: ["how-do-habits-work", "how-are-streaks-calculated", "what-are-trackers"],
  },
  {
    id: "what-are-trackers",
    category: "Features",
    question: "What are trackers?",
    answer: "Trackers let you monitor specific metrics over time — things like water intake, sleep quality, mood, or any custom metric you want to measure. They give you visibility into patterns and trends.",
    keywords: ["trackers", "track", "metrics", "monitor", "measure"],
    relatedIds: ["how-do-habits-work", "can-i-create-custom-habits", "how-are-streaks-calculated"],
  },
  {
    id: "how-are-streaks-calculated",
    category: "Features",
    question: "How are habit streaks calculated?",
    answer: "Habit streaks count consecutive completions based on your habit's schedule. If you set a daily habit and complete it every day, your streak grows. Missing a day resets the streak, but Intenteo also offers a recovery system so one miss doesn't erase your progress.",
    keywords: ["streaks", "calculate", "count", "miss", "recovery"],
    relatedIds: ["how-do-habits-work", "can-i-create-custom-habits", "what-are-trackers"],
  },
  {
    id: "what-is-journal",
    category: "Features",
    question: "What is the Journal?",
    answer: "The Journal is your space for daily reflection. You can capture thoughts, gratitude, mood, and insights about your day. Over time, it becomes a record of your growth and a source of self-awareness.",
    keywords: ["journal", "write", "diary", "log", "entry"],
    relatedIds: ["how-does-reflection-work", "can-i-use-custom-prompts", "can-i-review-reflections"],
  },
  {
    id: "how-does-reflection-work",
    category: "Features",
    question: "How does daily reflection work?",
    answer: "At the end of each day, you can log a reflection entry with your mood, gratitude, and notes. Intenteo helps you spot patterns between your habits, mood, and goal progress — turning experience into wisdom.",
    keywords: ["reflection", "daily", "end of day", "review"],
    relatedIds: ["what-is-journal", "can-i-use-custom-prompts", "can-i-review-reflections"],
  },
  {
    id: "can-i-use-custom-prompts",
    category: "Features",
    question: "Can I use my own journal prompts?",
    answer: "Yes. Intenteo provides built-in reflection prompts, but you can also write freely or create your own prompts. The journal adapts to your reflection style.",
    keywords: ["prompts", "custom", "own", "write", "journal"],
    relatedIds: ["what-is-journal", "how-does-reflection-work", "can-i-review-reflections"],
  },
  {
    id: "can-i-review-reflections",
    category: "Features",
    question: "Can I review previous reflections?",
    answer: "Yes. Your journal history is always accessible. You can browse past entries, search for specific topics, and see how your reflections evolve over time.",
    keywords: ["review", "previous", "history", "past", "entries"],
    relatedIds: ["what-is-journal", "how-does-reflection-work", "can-i-use-custom-prompts"],
  },

  // ─── Intent Score ───
  {
    id: "what-is-intent-score",
    category: "Intent Score",
    question: "What is the Intent Score?",
    answer: "The Intent Score is a daily measure of how intentionally you lived. It weighs task completion, habit consistency, goal alignment, and reflection quality into a single percentage — giving you a clear pulse on your day.",
    keywords: ["intent", "score", "what", "daily", "measure"],
    relatedIds: ["how-is-score-calculated", "is-score-productivity", "how-to-improve-score"],
  },
  {
    id: "how-is-score-calculated",
    category: "Intent Score",
    question: "How is my Intent Score calculated?",
    answer: "Your Intent Score is calculated based on four factors: tasks completed, habits practiced, goal alignment, and whether you logged a reflection. Each factor is weighted to reflect its contribution to intentional living.",
    keywords: ["calculate", "score", "formula", "computed", "factors"],
    relatedIds: ["what-is-intent-score", "is-score-productivity", "how-to-improve-score"],
  },
  {
    id: "is-score-productivity",
    category: "Intent Score",
    question: "Is the Intent Score a productivity score?",
    answer: "Not exactly. The Intent Score measures intentionality, not productivity. You can have a high score by completing a few meaningful tasks and maintaining your habits, even if your task count is low. It's about alignment, not volume.",
    keywords: ["productivity", "measure", "score", "same", "different"],
    relatedIds: ["what-is-intent-score", "how-is-score-calculated", "how-to-improve-score"],
  },
  {
    id: "how-to-improve-score",
    category: "Intent Score",
    question: "How can I improve my Intent Score?",
    answer: "Focus on consistency across all four areas: complete your tasks, maintain your habit streaks, align your actions with your goals, and take time to reflect. Small, consistent actions every day are the key.",
    keywords: ["improve", "increase", "better", "higher", "score"],
    relatedIds: ["what-is-intent-score", "how-is-score-calculated", "is-score-productivity"],
  },

  // ─── Account & Privacy ───
  {
    id: "how-to-create-account",
    category: "Account & Privacy",
    question: "How do I create an account?",
    answer: "Visit the Intenteo website or download the app and tap Sign Up. You can create an account with your email address in just a minute.",
    keywords: ["create", "account", "sign up", "register"],
    relatedIds: ["how-do-i-get-started", "how-to-delete-account", "how-is-data-handled"],
  },
  {
    id: "how-to-delete-account",
    category: "Account & Privacy",
    question: "How do I delete my account?",
    answer: "You can delete your account from your account settings. Upon deletion, your data will be permanently removed from our systems. Since Intenteo stores most data locally, you should also clear your browser data if desired.",
    keywords: ["delete", "account", "remove", "cancel"],
    relatedIds: ["how-to-create-account", "how-is-data-handled", "where-is-privacy-policy"],
  },
  {
    id: "how-is-data-handled",
    category: "Account & Privacy",
    question: "How is my information handled?",
    answer: "We take your privacy seriously. Intenteo primarily stores your data in your browser's local storage, meaning your data stays on your device. We do not sell your personal information. See our Privacy Policy for full details.",
    keywords: ["privacy", "data", "information", "handle", "protect"],
    relatedIds: ["where-is-privacy-policy", "how-to-delete-account", "do-i-need-account"],
  },
  {
    id: "where-is-privacy-policy",
    category: "Account & Privacy",
    question: "Where can I read the Privacy Policy?",
    answer: "You can read our full Privacy Policy at /privacy. It explains how we collect, use, store, and protect your information.",
    keywords: ["privacy", "policy", "read", "where"],
    relatedIds: ["how-is-data-handled", "how-to-delete-account", "how-to-create-account"],
  },

  // ─── Mobile App ───
  {
    id: "is-intenteo-on-mobile",
    category: "Mobile App",
    question: "Is Intenteo available on mobile?",
    answer: "Yes. Intenteo is available as a mobile app for iOS and Android. You can also use Intenteo directly from your web browser on any device.",
    keywords: ["mobile", "ios", "android", "phone", "app"],
    relatedIds: ["where-to-download-app", "is-there-web-version", "is-intenteo-on-android"],
  },
  {
    id: "where-to-download-app",
    category: "Mobile App",
    question: "Where can I download the Intenteo app?",
    answer: "You can download Intenteo from the App Store (iOS) or Google Play (Android). You can also use Intenteo directly from your web browser at inteo.app.",
    keywords: ["download", "app store", "google play", "where"],
    relatedIds: ["is-intenteo-on-mobile", "is-there-web-version", "is-intenteo-on-android"],
  },
  {
    id: "is-there-web-version",
    category: "Mobile App",
    question: "Is there a web version?",
    answer: "Yes. Intenteo is available as a web application that works in any modern browser. You can access it from your desktop, tablet, or phone.",
    keywords: ["web", "browser", "version", "desktop", "online"],
    relatedIds: ["is-intenteo-on-mobile", "where-to-download-app", "will-intenteo-expand-platforms"],
  },
  {
    id: "is-intenteo-on-android",
    category: "Mobile App",
    question: "Is Intenteo available on Android?",
    answer: "Yes. Intenteo is available for download on Google Play for Android devices.",
    keywords: ["android", "google play", "available", "mobile"],
    relatedIds: ["is-intenteo-on-mobile", "where-to-download-app", "will-intenteo-expand-platforms"],
  },
  {
    id: "will-intenteo-expand-platforms",
    category: "Mobile App",
    question: "Will Intenteo be available on other platforms?",
    answer: "We're actively working on expanding platform support. Currently available on iOS, Android, and web. Stay tuned for updates on additional platforms.",
    keywords: ["other", "platforms", "windows", "mac", "future"],
    relatedIds: ["is-intenteo-on-mobile", "is-intenteo-on-android", "is-there-web-version"],
  },

  // ─── Billing & Subscription ───
  {
    id: "billing-and-subscription",
    category: "Billing & Subscription",
    question: "Does Intenteo have paid plans?",
    answer: "Intenteo is free to use with core features. We may offer premium features in the future, but the core intentional living experience will always remain accessible.",
    keywords: ["paid", "plans", "subscription", "pricing", "premium"],
    relatedIds: ["is-intenteo-free", "how-to-delete-account", "how-is-data-handled"],
  },
]

export function getFaqById(id: string): FaqItem | undefined {
  return faqData.find((item) => item.id === id)
}

export function getRelatedFaqs(item: FaqItem): FaqItem[] {
  return item.relatedIds
    .map((id) => faqData.find((faq) => faq.id === id))
    .filter((faq): faq is FaqItem => faq !== undefined)
    .slice(0, 3)
}

export function getActiveCategories(): string[] {
  const cats = new Set(faqData.map((item) => item.category))
  return ["All", ...FAQ_CATEGORIES.filter((c) => c !== "All" && cats.has(c))]
}
