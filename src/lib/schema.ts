import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

/* ────────────────────────────────────────────────────── */
/* Enums                                                  */
/* ────────────────────────────────────────────────────── */

export const notificationCategoryEnum = pgEnum("notification_category", [
  "ai", "achievements", "reminders", "calendar", "challenges",
  "accountability", "system", "mentions",
])

export const eventCategoryEnum = pgEnum("event_category", [
  "task", "goal", "habit", "journal", "meeting", "personal", "challenge",
])

export const decisionStatusEnum = pgEnum("decision_status", [
  "pending", "successful", "failed", "cancelled",
])

export const memoryCategoryEnum = pgEnum("memory_category", [
  "journal", "achievement", "photo", "trip", "project", "milestone",
  "goal", "decision", "reflection",
])

export const challengeStatusEnum = pgEnum("challenge_status", [
  "active", "completed", "suggested", "community",
])

export const taskPriorityEnum = pgEnum("task_priority", ["high", "medium", "low"])

export const energyRequirementEnum = pgEnum("energy_requirement", ["low", "medium", "high"])

export const goalTypeEnum = pgEnum("goal_type", ["annual", "quarterly", "monthly", "weekly"])

export const habitFrequencyEnum = pgEnum("habit_frequency", ["daily", "weekly"])

export const journalTypeEnum = pgEnum("journal_type", [
  "morning", "daily", "reflection", "gratitude", "decision", "dream", "legacy",
])

/* ────────────────────────────────────────────────────── */
/* User Profile                                           */
/* ────────────────────────────────────────────────────── */

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  futureSelfSummary: text("future_self_summary"),
  lifeVision: text("life_vision"),
  intentScore: integer("intent_score").default(0).notNull(),
  productivityScore: integer("productivity_score").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  values: jsonb("values").$type<string[]>().default([]).notNull(),
  lifeWheel: jsonb("life_wheel").$type<{
    health: number; career: number; finance: number; relationships: number;
    faith: number; learning: number; mentalWellbeing: number; fun: number
  }>().default({
    health: 0, career: 0, finance: 0, relationships: 0,
    faith: 0, learning: 0, mentalWellbeing: 0, fun: 0,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/* ────────────────────────────────────────────────────── */
/* Notifications                                          */
/* ────────────────────────────────────────────────────── */

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  icon: varchar("icon", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  category: notificationCategoryEnum("category").notNull(),
  read: boolean("read").default(false).notNull(),
  actionLabel: varchar("action_label", { length: 100 }),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_read_idx").on(table.read),
])

/* ────────────────────────────────────────────────────── */
/* Calendar Events                                        */
/* ────────────────────────────────────────────────────── */

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  category: eventCategoryEnum("category").notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  location: text("location"),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringRule: text("recurring_rule"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("calendar_events_user_id_idx").on(table.userId),
  index("calendar_events_date_idx").on(table.date),
])

/* ────────────────────────────────────────────────────── */
/* Decisions                                              */
/* ────────────────────────────────────────────────────── */

export const decisions = pgTable("decisions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  reason: text("reason").notNull(),
  alternatives: jsonb("alternatives").$type<string[]>().default([]).notNull(),
  pros: jsonb("pros").$type<string[]>().default([]).notNull(),
  cons: jsonb("cons").$type<string[]>().default([]).notNull(),
  expectedOutcome: text("expected_outcome").notNull(),
  confidence: integer("confidence").default(50).notNull(),
  riskLevel: varchar("risk_level", { length: 10 }).default("medium").notNull(),
  date: timestamp("date").notNull(),
  reviewDate: timestamp("review_date"),
  actualOutcome: text("actual_outcome"),
  lessonsLearned: text("lessons_learned"),
  status: decisionStatusEnum("status").default("pending").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("decisions_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Memories                                               */
/* ────────────────────────────────────────────────────── */

export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  category: memoryCategoryEnum("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  mood: integer("mood"),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("memories_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Challenges                                             */
/* ────────────────────────────────────────────────────── */

export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  duration: integer("duration").notNull(),
  daysCompleted: integer("days_completed").default(0).notNull(),
  progress: real("progress").default(0).notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
  intentScoreReward: integer("intent_score_reward").default(0).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: challengeStatusEnum("status").default("suggested").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("challenges_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Achievements                                           */
/* ────────────────────────────────────────────────────── */

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
}, (table) => [
  index("achievements_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Tasks                                                  */
/* ────────────────────────────────────────────────────── */

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  purpose: text("purpose").notNull(),
  futureSelfAlignment: text("future_self_alignment").notNull(),
  intentScore: integer("intent_score").default(0).notNull(),
  deadline: timestamp("deadline"),
  completed: boolean("completed").default(false).notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  projectId: text("project_id"),
  habitId: text("habit_id"),
  estimatedDuration: integer("estimated_duration"),
  actualDuration: integer("actual_duration"),
  energyRequirement: energyRequirementEnum("energy_requirement").default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("tasks_user_id_idx").on(table.userId),
  index("tasks_completed_idx").on(table.completed),
])

/* ────────────────────────────────────────────────────── */
/* Goals                                                  */
/* ────────────────────────────────────────────────────── */

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: goalTypeEnum("type").notNull(),
  progress: real("progress").default(0).notNull(),
  deadline: timestamp("deadline"),
  intentScore: integer("intent_score").default(0).notNull(),
  futureSelfAlignment: text("future_self_alignment").notNull(),
  milestones: jsonb("milestones").$type<Array<{
    id: string; title: string; completed: boolean; completedAt?: string
  }>>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("goals_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Habits                                                 */
/* ────────────────────────────────────────────────────── */

export const habits = pgTable("habits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  frequency: habitFrequencyEnum("frequency").default("daily").notNull(),
  streak: integer("streak").default(0).notNull(),
  bestStreak: integer("best_streak").default(0).notNull(),
  completedToday: boolean("completed_today").default(false).notNull(),
  completionRate: real("completion_rate").default(0).notNull(),
  intentScore: integer("intent_score").default(0).notNull(),
  futureSelfAlignment: text("future_self_alignment").notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("habits_user_id_idx").on(table.userId),
])

/* ────────────────────────────────────────────────────── */
/* Journal Entries                                        */
/* ────────────────────────────────────────────────────── */

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: journalTypeEnum("type").notNull(),
  date: timestamp("date").notNull(),
  mood: integer("mood"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("journal_entries_user_id_idx").on(table.userId),
  index("journal_entries_date_idx").on(table.date),
  index("journal_entries_type_idx").on(table.type),
])

/* ────────────────────────────────────────────────────── */
/* Projects (new)                                         */
/* ────────────────────────────────────────────────────── */

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  progress: real("progress").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("projects_user_id_idx").on(table.userId),
])
