"use client"

export type TrackerCategory = "All" | "Mental Wellness" | "Health" | "Fitness" | "Lifestyle" | "Finance" | "Content Creation" | "Education" | "Business" | "Mindfulness" | "Custom"

export type ChartType = "line" | "bar" | "calendar_heatmap" | "pie" | "progress_ring" | "streak_counter"

export type MeasurementUnit = "hours" | "minutes" | "seconds" | "days" | "weeks" | "months" | "years" | "km" | "m" | "steps" | "calories" | "litres" | "ml" | "pages" | "books" | "reps" | "kg" | "lbs" | "naira" | "dollar" | "euro" | "percent" | "points" | "custom"

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

export interface TrackerMetric {
  id: string
  name: string
  unit: MeasurementUnit
  customUnit?: string
}

export interface TrackerTemplate {
  id: string
  name: string
  description: string
  category: TrackerCategory
  icon: string
  color: string
  colorHex: string
  features: string[]
  targetAudience: string
  whatItAchieves: string
  metrics: TrackerMetric[]
  supportedCharts: ChartType[]
  defaultFrequency: Frequency
  defaultTarget?: number
  previewSections: string[]
  benefits: string[]
}

export interface PinnedTracker {
  trackerId: string
  pinnedAt: string
  customName?: string
}

export interface CustomTrackerConfig {
  name: string
  category: TrackerCategory
  icon: string
  colorHex: string
  unit: MeasurementUnit
  customUnit?: string
  frequency: Frequency
  targetValue?: number
  reminderEnabled: boolean
  notes: string
  preferredCharts: ChartType[]
  showOnDashboard: boolean
  enableNotifications: boolean
}

export const TRACKER_CATEGORIES: TrackerCategory[] = [
  "All", "Mental Wellness", "Health", "Fitness", "Mindfulness", "Lifestyle", "Business", "Finance", "Education", "Content Creation", "Custom"
]

export const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string }[] = [
  { value: "hours", label: "Hours" },
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Seconds" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
  { value: "km", label: "Kilometers" },
  { value: "m", label: "Meters" },
  { value: "steps", label: "Steps" },
  { value: "calories", label: "Calories" },
  { value: "litres", label: "Litres" },
  { value: "ml", label: "Millilitres" },
  { value: "pages", label: "Pages" },
  { value: "books", label: "Books" },
  { value: "reps", label: "Repetitions" },
  { value: "kg", label: "Kilograms" },
  { value: "lbs", label: "Pounds" },
  { value: "naira", label: "₦ (Naira)" },
  { value: "dollar", label: "$ (Dollar)" },
  { value: "euro", label: "€ (Euro)" },
  { value: "percent", label: "%" },
  { value: "points", label: "Points" },
  { value: "custom", label: "Custom..." },
]

export const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "calendar_heatmap", label: "Calendar Heatmap" },
  { value: "pie", label: "Pie Chart" },
  { value: "progress_ring", label: "Progress Ring" },
  { value: "streak_counter", label: "Streak Counter" },
]

export const TRACKER_TEMPLATES: TrackerTemplate[] = [
  {
    id: "mood",
    name: "Mood Tracker",
    description: "Track your emotions, identify patterns, and improve your emotional well-being over time.",
    category: "Mental Wellness",
    icon: "😊",
    color: "purple",
    colorHex: "#8B5CF6",
    features: ["Daily mood logging", "Emotion tagging", "Pattern recognition", "Mood trends over time", "Journal integration", "Weekly insights"],
    targetAudience: "Anyone who wants to understand their emotional patterns and improve mental health",
    whatItAchieves: "Build emotional awareness, identify triggers, and develop healthier coping strategies through consistent tracking.",
    metrics: [
      { id: "mood_score", name: "Mood Score", unit: "points" },
      { id: "energy_level", name: "Energy Level", unit: "points" },
    ],
    supportedCharts: ["line", "calendar_heatmap", "pie"],
    defaultFrequency: "daily",
    previewSections: ["Mood calendar", "Emotion breakdown chart", "Weekly trend line", "Streak counter"],
    benefits: ["Understand emotional triggers", "Track mood over weeks and months", "Identify patterns and correlations", "Improve self-awareness"],
  },
  {
    id: "period",
    name: "Period Tracker",
    description: "Track menstrual cycles, symptoms, moods, ovulation, and important health insights.",
    category: "Health",
    icon: "🌸",
    color: "pink",
    colorHex: "#EC4899",
    features: ["Cycle tracking", "Symptom logging", "Ovulation prediction", "Period calendar", "Flow intensity", "Health insights"],
    targetAudience: "People who want to track their menstrual cycle and reproductive health",
    whatItAchieves: "Gain insights into cycle patterns, predict upcoming periods, and track symptoms for better health management.",
    metrics: [
      { id: "cycle_day", name: "Cycle Day", unit: "days" },
      { id: "symptoms", name: "Symptoms", unit: "points" },
    ],
    supportedCharts: ["calendar_heatmap", "line", "bar"],
    defaultFrequency: "daily",
    previewSections: ["Cycle calendar", "Symptom frequency chart", "Cycle length history", "Ovulation predictor"],
    benefits: ["Understand your cycle patterns", "Predict upcoming periods", "Track symptoms and mood changes", "Plan activities around your cycle"],
  },
  {
    id: "weight",
    name: "Weight Tracker",
    description: "Monitor weight changes, BMI, body measurements, and long-term health progress.",
    category: "Fitness",
    icon: "⚖️",
    color: "blue",
    colorHex: "#3B82F6",
    features: ["Daily weight logging", "BMI calculation", "Body measurements", "Progress photos", "Goal setting", "Trend analysis"],
    targetAudience: "Anyone looking to manage their weight, build healthier habits, or achieve fitness goals",
    whatItAchieves: "Track weight changes over time, visualize progress toward goals, and maintain accountability.",
    metrics: [
      { id: "weight", name: "Weight", unit: "kg" },
      { id: "body_fat", name: "Body Fat", unit: "percent" },
    ],
    supportedCharts: ["line", "bar", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 70,
    previewSections: ["Weight trend line", "BMI indicator", "Goal progress ring", "Weekly comparison"],
    benefits: ["Visualize weight trends over time", "Set and track realistic goals", "Maintain accountability", "Identify patterns in progress"],
  },
  {
    id: "exercise",
    name: "Exercise Tracker",
    description: "Track workouts, exercise routines, cardio sessions, strength training, and activity streaks.",
    category: "Fitness",
    icon: "🏃",
    color: "green",
    colorHex: "#22C55E",
    features: ["Workout logging", "Exercise library", "Duration tracking", "Calorie burn", "Streak tracking", "Progress photos"],
    targetAudience: "Fitness enthusiasts, athletes, and anyone building an exercise routine",
    whatItAchieves: "Stay consistent with workouts, track improvements, and build lasting exercise habits.",
    metrics: [
      { id: "duration", name: "Duration", unit: "minutes" },
      { id: "calories", name: "Calories Burned", unit: "calories" },
    ],
    supportedCharts: ["bar", "line", "streak_counter", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 30,
    previewSections: ["Workout calendar", "Duration bar chart", "Streak counter", "Weekly summary"],
    benefits: ["Build consistent exercise habits", "Track workout progress over time", "Stay motivated with streaks", "Measure fitness improvements"],
  },
  {
    id: "lifestyle",
    name: "Lifestyle Tracker",
    description: "Build healthy routines by tracking sleep, water intake, meditation, reading, screen time, and other daily habits.",
    category: "Lifestyle",
    icon: "🌱",
    color: "emerald",
    colorHex: "#10B981",
    features: ["Sleep tracking", "Water intake", "Meditation time", "Reading habits", "Screen time", "Custom habits"],
    targetAudience: "Anyone who wants to build healthier daily routines and track lifestyle habits",
    whatItAchieves: "Develop balanced daily routines, improve sleep quality, increase water intake, and reduce screen time.",
    metrics: [
      { id: "sleep_hours", name: "Sleep Hours", unit: "hours" },
      { id: "water", name: "Water Intake", unit: "litres" },
    ],
    supportedCharts: ["bar", "line", "calendar_heatmap", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 8,
    previewSections: ["Sleep trend chart", "Water intake tracker", "Habit completion heatmap", "Weekly averages"],
    benefits: ["Build healthier daily routines", "Improve sleep quality", "Stay hydrated", "Reduce screen time"],
  },
  {
    id: "finance",
    name: "Finance Tracker",
    description: "Track income, expenses, savings, investments, budgets, and financial goals.",
    category: "Finance",
    icon: "💰",
    color: "yellow",
    colorHex: "#EAB308",
    features: ["Income tracking", "Expense logging", "Budget management", "Savings goals", "Investment tracking", "Financial reports"],
    targetAudience: "Anyone who wants to take control of their finances and build wealth",
    whatItAchieves: "Gain clarity on spending habits, build savings, and work toward financial goals.",
    metrics: [
      { id: "income", name: "Income", unit: "naira" },
      { id: "expenses", name: "Expenses", unit: "naira" },
    ],
    supportedCharts: ["bar", "pie", "line", "progress_ring"],
    defaultFrequency: "monthly",
    previewSections: ["Income vs Expenses chart", "Expense breakdown pie", "Savings progress ring", "Monthly trend"],
    benefits: ["Understand spending patterns", "Build savings habits", "Track financial goals", "Make informed financial decisions"],
  },
  {
    id: "content",
    name: "Content Calendar",
    description: "Plan, organize, schedule, and monitor content across social media, blogs, podcasts, YouTube, and newsletters.",
    category: "Content Creation",
    icon: "📅",
    color: "orange",
    colorHex: "#F97316",
    features: ["Content scheduling", "Platform management", "Analytics tracking", "Idea bank", "Draft pipeline", "Performance metrics"],
    targetAudience: "Content creators, social media managers, bloggers, and marketers",
    whatItAchieves: "Stay organized with content publishing, track performance, and maintain a consistent posting schedule.",
    metrics: [
      { id: "posts", name: "Posts Published", unit: "points" },
      { id: "engagement", name: "Engagement Rate", unit: "percent" },
    ],
    supportedCharts: ["bar", "line", "calendar_heatmap", "pie"],
    defaultFrequency: "weekly",
    previewSections: ["Content calendar", "Platform performance chart", "Engagement trends", "Publishing streak"],
    benefits: ["Stay organized with content planning", "Track publishing consistency", "Measure content performance", "Plan ahead with calendar view"],
  },
  {
    id: "student",
    name: "Student Tracker",
    description: "Stay on top of classes, assignments, exams, study sessions, GPA, attendance, and academic goals.",
    category: "Education",
    icon: "🎓",
    color: "indigo",
    colorHex: "#6366F1",
    features: ["Class schedule", "Assignment tracking", "Exam preparation", "Study time logging", "GPA calculator", "Attendance tracking"],
    targetAudience: "Students at all levels who want to stay organized and improve academic performance",
    whatItAchieves: "Manage coursework effectively, stay on top of deadlines, and improve academic performance.",
    metrics: [
      { id: "study_hours", name: "Study Hours", unit: "hours" },
      { id: "gpa", name: "GPA", unit: "points" },
    ],
    supportedCharts: ["bar", "line", "progress_ring", "calendar_heatmap"],
    defaultFrequency: "weekly",
    previewSections: ["Study hours chart", "Assignment deadlines", "GPA trend", "Attendance heatmap"],
    benefits: ["Stay organized with coursework", "Track study habits", "Monitor academic progress", "Never miss a deadline"],
  },
  {
    id: "business",
    name: "Business Tracker",
    description: "Track business growth, revenue, leads, customers, projects, sales, and operational performance.",
    category: "Business",
    icon: "🏢",
    color: "teal",
    colorHex: "#14B8A6",
    features: ["Revenue tracking", "Lead management", "Customer analytics", "Project progress", "Sales pipeline", "KPI dashboards"],
    targetAudience: "Entrepreneurs, small business owners, and managers",
    whatItAchieves: "Monitor business health, track growth metrics, and make data-driven decisions.",
    metrics: [
      { id: "revenue", name: "Revenue", unit: "naira" },
      { id: "leads", name: "Leads Generated", unit: "points" },
    ],
    supportedCharts: ["line", "bar", "pie", "progress_ring"],
    defaultFrequency: "monthly",
    previewSections: ["Revenue trend line", "Lead conversion chart", "Project progress cards", "Sales pipeline"],
    benefits: ["Track business growth", "Monitor key metrics", "Make informed decisions", "Identify growth opportunities"],
  },
  {
    id: "mindfulness",
    name: "Mindfulness Tracker",
    description: "Track meditation, breathwork, prayer, and mindful practices to build inner peace and emotional resilience.",
    category: "Mindfulness",
    icon: "🧘",
    color: "violet",
    colorHex: "#7C3AED",
    features: ["Session logging", "Multiple practice types", "Mood before/after", "Streak tracking", "Weekly summaries", "Guided practice links", "Duration tracking", "Reflection prompts"],
    targetAudience: "Anyone seeking mental clarity, stress reduction, spiritual growth, or emotional balance through mindfulness practice",
    whatItAchieves: "Build a consistent mindfulness practice, reduce stress, increase self-awareness, and develop emotional resilience through tracked, intentional stillness.",
    metrics: [
      { id: "duration", name: "Duration", unit: "minutes" },
      { id: "sessions", name: "Sessions", unit: "points" },
    ],
    supportedCharts: ["bar", "line", "streak_counter", "calendar_heatmap", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 20,
    previewSections: ["Session calendar", "Duration trends", "Practice type breakdown", "Streak counter", "Mood comparison", "Weekly summary"],
    benefits: ["Reduce stress and anxiety", "Build emotional resilience", "Improve focus and clarity", "Deepen spiritual practice", "Track mood improvements", "Develop consistent stillness habits"],
  },
  {
    id: "custom",
    name: "Custom Tracker",
    description: "Create your own tracker from scratch for anything you want to monitor.",
    category: "Custom",
    icon: "⚙️",
    color: "gray",
    colorHex: "#6B7280",
    features: ["Fully customizable", "Choose your metrics", "Pick your charts", "Set your frequency", "Custom reminders", "Flexible dashboard"],
    targetAudience: "Anyone with unique tracking needs not covered by existing templates",
    whatItAchieves: "Build a personalized tracker tailored to your specific goals and lifestyle.",
    metrics: [],
    supportedCharts: ["line", "bar", "calendar_heatmap", "pie", "progress_ring", "streak_counter"],
    defaultFrequency: "daily",
    previewSections: ["Custom dashboard", "Flexible charts", "Personalized metrics", "Configurable reminders"],
    benefits: ["Track anything you want", "Fully personalized experience", "Choose your own metrics", "Flexible and extensible"],
  },
]

export function getTrackerTemplate(id: string): TrackerTemplate | undefined {
  return TRACKER_TEMPLATES.find(t => t.id === id)
}

export function getTrackersByCategory(category: TrackerCategory): TrackerTemplate[] {
  if (category === "All") return TRACKER_TEMPLATES
  return TRACKER_TEMPLATES.filter(t => t.category === category)
}

export function searchTrackers(query: string): TrackerTemplate[] {
  const q = query.toLowerCase()
  return TRACKER_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  )
}

const PINNED_KEY = "intenteo-pinned-trackers"

export function getPinnedTrackers(): PinnedTracker[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(PINNED_KEY) || "[]")
  } catch { return [] }
}

export function pinTracker(trackerId: string): void {
  const pinned = getPinnedTrackers()
  if (!pinned.find(p => p.trackerId === trackerId)) {
    pinned.push({ trackerId, pinnedAt: new Date().toISOString() })
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinned))
    window.dispatchEvent(new Event("pinned-trackers-changed"))
  }
}

export function unpinTracker(trackerId: string): void {
  const pinned = getPinnedTrackers().filter(p => p.trackerId !== trackerId)
  localStorage.setItem(PINNED_KEY, JSON.stringify(pinned))
  window.dispatchEvent(new Event("pinned-trackers-changed"))
}

export function isTrackerPinned(trackerId: string): boolean {
  return getPinnedTrackers().some(p => p.trackerId === trackerId)
}
