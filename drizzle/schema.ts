import { pgTable, index, foreignKey, text, varchar, timestamp, boolean, integer, real, jsonb, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const challengeStatus = pgEnum("challenge_status", ['active', 'completed', 'suggested', 'community'])
export const decisionStatus = pgEnum("decision_status", ['pending', 'successful', 'failed', 'cancelled'])
export const energyRequirement = pgEnum("energy_requirement", ['low', 'medium', 'high'])
export const eventCategory = pgEnum("event_category", ['task', 'goal', 'habit', 'journal', 'meeting', 'personal', 'challenge'])
export const goalType = pgEnum("goal_type", ['annual', 'quarterly', 'monthly', 'weekly'])
export const habitFrequency = pgEnum("habit_frequency", ['daily', 'weekly'])
export const journalType = pgEnum("journal_type", ['morning', 'daily', 'reflection', 'gratitude', 'decision', 'dream', 'legacy'])
export const memoryCategory = pgEnum("memory_category", ['journal', 'achievement', 'photo', 'trip', 'project', 'milestone', 'goal', 'decision', 'reflection'])
export const notificationCategory = pgEnum("notification_category", ['ai', 'achievements', 'reminders', 'calendar', 'challenges', 'accountability', 'system', 'mentions'])
export const taskPriority = pgEnum("task_priority", ['high', 'medium', 'low'])


export const calendarEvents = pgTable("calendar_events", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	date: timestamp({ mode: 'string' }).notNull(),
	startTime: varchar("start_time", { length: 10 }),
	endTime: varchar("end_time", { length: 10 }),
	category: eventCategory().notNull(),
	color: varchar({ length: 20 }).notNull(),
	location: text(),
	isRecurring: boolean("is_recurring").default(false).notNull(),
	recurringRule: text("recurring_rule"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("calendar_events_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("calendar_events_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "calendar_events_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const challenges = pgTable("challenges", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	duration: integer().notNull(),
	daysCompleted: integer("days_completed").default(0).notNull(),
	progress: real().default(0).notNull(),
	xpReward: integer("xp_reward").default(0).notNull(),
	intentScoreReward: integer("intent_score_reward").default(0).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: challengeStatus().default('suggested').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("challenges_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "challenges_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const decisions = pgTable("decisions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	reason: text().notNull(),
	alternatives: jsonb().default([]).notNull(),
	pros: jsonb().default([]).notNull(),
	cons: jsonb().default([]).notNull(),
	expectedOutcome: text("expected_outcome").notNull(),
	confidence: integer().default(50).notNull(),
	riskLevel: varchar("risk_level", { length: 10 }).default('medium').notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	reviewDate: timestamp("review_date", { mode: 'string' }),
	actualOutcome: text("actual_outcome"),
	lessonsLearned: text("lessons_learned"),
	status: decisionStatus().default('pending').notNull(),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("decisions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "decisions_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const goals = pgTable("goals", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	type: goalType().notNull(),
	progress: real().default(0).notNull(),
	deadline: timestamp({ mode: 'string' }),
	intentScore: integer("intent_score").default(0).notNull(),
	futureSelfAlignment: text("future_self_alignment").notNull(),
	milestones: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("goals_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "goals_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const habits = pgTable("habits", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	frequency: habitFrequency().default('daily').notNull(),
	streak: integer().default(0).notNull(),
	bestStreak: integer("best_streak").default(0).notNull(),
	completedToday: boolean("completed_today").default(false).notNull(),
	completionRate: real("completion_rate").default(0).notNull(),
	intentScore: integer("intent_score").default(0).notNull(),
	futureSelfAlignment: text("future_self_alignment").notNull(),
	color: varchar({ length: 20 }).notNull(),
	icon: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("habits_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "habits_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const journalEntries = pgTable("journal_entries", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	type: journalType().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	mood: integer(),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("journal_entries_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("journal_entries_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("journal_entries_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "journal_entries_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const memories = pgTable("memories", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	category: memoryCategory().notNull(),
	tags: jsonb().default([]).notNull(),
	mood: integer(),
	photo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("memories_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "memories_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	icon: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	category: notificationCategory().notNull(),
	read: boolean().default(false).notNull(),
	actionLabel: varchar("action_label", { length: 100 }),
	actionUrl: text("action_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notifications_read_idx").using("btree", table.read.asc().nullsLast().op("bool_ops")),
	index("notifications_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "notifications_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	color: varchar({ length: 20 }),
	icon: varchar({ length: 50 }),
	progress: real().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("projects_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "projects_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const achievements = pgTable("achievements", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	icon: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 20 }).notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("achievements_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "achievements_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const userProfiles = pgTable("user_profiles", {
	id: text().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	avatar: text(),
	bio: text(),
	futureSelfSummary: text("future_self_summary"),
	lifeVision: text("life_vision"),
	intentScore: integer("intent_score").default(0).notNull(),
	productivityScore: integer("productivity_score").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	values: jsonb().default([]).notNull(),
	lifeWheel: jsonb("life_wheel").default({"fun":0,"faith":0,"career":0,"health":0,"finance":0,"learning":0,"relationships":0,"mentalWellbeing":0}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_profiles_email_unique").on(table.email),
]);

export const tasks = pgTable("tasks", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	purpose: text().notNull(),
	futureSelfAlignment: text("future_self_alignment").notNull(),
	intentScore: integer("intent_score").default(0).notNull(),
	deadline: timestamp({ mode: 'string' }),
	completed: boolean().default(false).notNull(),
	priority: taskPriority().default('medium').notNull(),
	tags: jsonb().default([]).notNull(),
	projectId: text("project_id"),
	habitId: text("habit_id"),
	estimatedDuration: integer("estimated_duration"),
	actualDuration: integer("actual_duration"),
	energyRequirement: energyRequirement("energy_requirement").default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tasks_completed_idx").using("btree", table.completed.asc().nullsLast().op("bool_ops")),
	index("tasks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.id],
			name: "tasks_user_id_user_profiles_id_fk"
		}).onDelete("cascade"),
]);
