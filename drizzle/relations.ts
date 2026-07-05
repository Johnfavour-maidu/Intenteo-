import { relations } from "drizzle-orm/relations";
import { userProfiles, calendarEvents, challenges, decisions, goals, habits, journalEntries, memories, notifications, projects, achievements, tasks } from "./schema";

export const calendarEventsRelations = relations(calendarEvents, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [calendarEvents.userId],
		references: [userProfiles.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({many}) => ({
	calendarEvents: many(calendarEvents),
	challenges: many(challenges),
	decisions: many(decisions),
	goals: many(goals),
	habits: many(habits),
	journalEntries: many(journalEntries),
	memories: many(memories),
	notifications: many(notifications),
	projects: many(projects),
	achievements: many(achievements),
	tasks: many(tasks),
}));

export const challengesRelations = relations(challenges, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [challenges.userId],
		references: [userProfiles.id]
	}),
}));

export const decisionsRelations = relations(decisions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [decisions.userId],
		references: [userProfiles.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [goals.userId],
		references: [userProfiles.id]
	}),
}));

export const habitsRelations = relations(habits, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [habits.userId],
		references: [userProfiles.id]
	}),
}));

export const journalEntriesRelations = relations(journalEntries, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [journalEntries.userId],
		references: [userProfiles.id]
	}),
}));

export const memoriesRelations = relations(memories, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [memories.userId],
		references: [userProfiles.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [notifications.userId],
		references: [userProfiles.id]
	}),
}));

export const projectsRelations = relations(projects, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [projects.userId],
		references: [userProfiles.id]
	}),
}));

export const achievementsRelations = relations(achievements, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [achievements.userId],
		references: [userProfiles.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [tasks.userId],
		references: [userProfiles.id]
	}),
}));