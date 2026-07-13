<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Habits Page — Complete

- **Habit Intelligence System** (10 features delivered):
  - `habit-utils.ts` — health, lifecycle, trend, recovery, coaching, smart next actions, score breakdown, completion quality
  - `habit-analytics-drawer.tsx` — right-side analytics panel with health badge, lifecycle, trend, score breakdown bars, coaching, recent activity, habit story, tips
  - `habit-types.ts` — shared Habit/Schedule/Reminder interfaces
  - Recovery System — modal for Recover Streak / Accept Miss with penalty formula
  - Completion Quality auto-calculated (perfect/good/partial based on time accuracy)
  - Health badges in Table, List, Vertical views
  - Trend indicators in all views
  - Vertical view rewritten: grid dividers, year view (Jan–Dec), drag-drop reorder, health/trend in column head
  - List view unused imports cleaned up
  - Journey page updated with enriched habit data, recovery/streak milestones
  - `circular-view.tsx` deleted

## Goals Page — New Features

- **Goal Intelligence System** (added in this session):
  - `goal-utils.ts` — goal health calculation (progress × 0.4 + deadline × 0.15 + habits × 0.15 + projects × 0.1 + milestones × 0.1 + consistency × 0.1), lifecycle stages (Planning→Active→Building→On Track→Near Completion→Completed→Archived), trend (up/down/stable based on pace), smart next action, coaching, score breakdown, journey builder, celebration detection at 25/50/75/100%
  - `goal-analytics-drawer.tsx` — right-side panel with header (health badge, lifecycle, trend), health score, days remaining, smart next action, health score breakdown bars, linked habits with scores, linked projects, coaching, recent activity, goal story, tips to improve
  - GoalCard enhanced with health badge, trend indicator, Smart Next Action panel
  - Health filter buttons (All / Excellent / On Track / Needs Attention / At Risk)
  - Life Vision dashboard upgraded to 5 stats (Total, Avg Health, Avg Progress, Excellent count, Overdue count)
  - Celebration overlay on milestone progress (25/50/75/100%) with bounce animation
  - Type aligned via `GoalData`/`GoalProject`/`GoalHabit` interfaces for cross-file compatibility with structural casting
  - Clicking a goal card opens analytics drawer; "Edit Goal" button in drawer opens existing GoalDetailDrawer

## Goals Page — 5-Phase Transformation (Complete)

### Phase 1: Visual Goal Board
- Cards is default view, Focus Goals section (max 5, pin/unpin), gold star badge, `focused`/`focusOrder` fields

### Phase 2: Vision Images
- `heroImage` and `supportingImages` fields, VisionImagesSection (upload/replace/remove/reorder), Lightbox viewer

### Phase 3: Goal Reviews
- `GoalReview` interface, `ReviewFrequency` type (weekly/biweekly/monthly/quarterly), `REVIEW_FREQUENCY_CONFIG`, `isReviewDue()`, `daysSinceReview()`, `reviewFrequency`/`lastReviewedAt`/`reviews` fields
- GoalReviewModal with 7 review questions, review due notification on GoalCard, review history in GoalDetailDrawer

### Phase 4: Core Value Library
- `linkedValueIds` field on Goal interface, CoreValueLibrary component with 4 categories (Spiritual/Personal/Relational/Professional, 20 templates), multi-select, custom value creation
- Value selector in AddGoalModal and GoalDetailDrawer, value alignment badges on GoalCard, `calcValueAlignment()` in goal-utils.ts

### Phase 5: Visualization & Motivation Engine
- `GoalForecast` (predicted date, pace: ahead/on-pace/behind/stalled), `GoalProbability` (0-100% score with factors), `GoalMomentum` (building/steady/fading/stalled)
- GoalMotivationPanel (forecast, probability ring, momentum indicator, motivational quotes, contextual nudges)
- Enhanced celebration overlay with confetti animation (20 emoji particles)
- 12 motivational quotes, `getMotivationalNudge()` with context-aware messages

## Key Decisions

- **Health formula**: `progress * 0.4 + deadlineScore * 0.15 + habitScore * 0.15 + projectScore * 0.1 + milestoneScore * 0.1 + consistency * 0.1`
- **Trend**: Compared actual progress vs expected pace (time elapsed / total span); up if ≥115% of expected, down if ≤85%
- **Celebration**: Detects when progress crosses 25/50/75/100% thresholds; shows a 3-second animated overlay
- **Type casting**: Local `Goal`/`Project`/`Habit` interfaces differ from util types; structural `as unknown as GoalData` casting used in goal-utils consumer functions (GoalCard, filteredAndSorted, dashboard stats) to avoid type duplication
- **Last activity tracking**: `updateGoal` and `saveGoal` now set `lastActivity: getTodayISO()` for consistency scoring
- **Filter architecture**: `healthFilter` state separate from existing `GoalFilterMode` — applied as an additional filter stage in `filteredAndSorted`

## Critical Context

- Project path: `C:\Users\HP\Documents\WEBSITES\INTENTEO`
- Vercel deploy: `npx vercel --yes --prod --scope john-favourite` (use `vercel_*` MCP tools instead of token)
- Production URL: https://intenteo.vercel.app
- localStorage keys: `intenteo-goals`, `intenteo-projects`, `intenteo-habits`, `intenteo-habits-period`, `intenteo-habits-view`, `intenteo-vision`
