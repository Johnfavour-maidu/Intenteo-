<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Architecture (Refactored)

The codebase is split into 4 layers:

### `src/shared/` — Business Logic (platform-agnostic)
- `types/` — All domain types (Task, Goal, Habit, Vision, etc.)
- `utils/` — cn(), formatDate, formatTime, calculateIntentScore
- `calculations/` — Intent Score engine, habit-utils, goal-utils, reminder-types
- `context/` — Auth context, user profile context
- `hooks/` — useSidebar, useUndoRedo
- `store/` — localStorage-backed stores (user-settings, security, quick-access, etc.)
- `services/` — Reminder sounds, resources
- `auth/` — Auth context
- `api/` — DB layer
- `database/` — Schema
- `constants/` — APP_NAME, STORAGE_KEYS
- `components/` — Shared UI primitives (Button, Input, Card, Badge, etc.)

### `src/desktop/` — Desktop Web UI
- `layouts/desktop-layout.tsx` — Desktop shell with sidebar + header
- `navigation/` — Sidebar, header
- `pages/` — Dashboard, tasks, habits, goals, journal, reports, settings, focus
- `components/` — Cards (intent-score, tasks, habits, goals), settings, reports, shared-ui

### `src/mobile/` — Mobile App UI (React Native)
- `layouts/` — Mobile app shell, auth layout, main layout
- `navigation/` — Root stack navigator, bottom tabs
- `screens/` — Dashboard, tasks, habits, goals, journal, vision, profile, trackers, notifications, settings
- `components/` — UI primitives, habits, goals

### `src/router/` — Platform Routing
- `platform-detector.tsx` — usePlatform() hook (desktop/mobile detection)
- `app-shell.tsx` — AppShell (loads DesktopApp or MobileApp)
- `index.ts` — Barrel exports

### Import Conventions
- Desktop pages import from `@/shared/` for types/utils/calculations
- Desktop pages import from `@/components/` for UI primitives
- Mobile screens import from `intenteo-mobile/src/` for theme/components/storage
- Original files in `src/components/` remain as the source of truth; `src/desktop/` and `src/mobile/` reference them

### Build Commands
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type check
- `npx tsc --noEmit` — Quick type check
- `npm run build` — Production build

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

## Recent Work — Life Vision Framework Simplification (COMPLETE, deployed)

### Refinement passes completed
1. **12 Vision Framework refinements** (deployed earlier): removed Purpose Hierarchy text; Life Influence to searchable Life Area multi-select (30 DEFAULT_LIFE_AREAS); DD/MM/YYYY dates; quotation around Purpose; dynamic Purpose height; searchable VALUE_LIBRARY; simplified ValueEditModal; value cards show purposeConnection only; pin limit 5; sorting pinned,recent,alphabetical.
2. **Goal Details Drawer** (deployed): removed Health everywhere; single status badge; 16:9 heroImage; Next Action; Intenteo Insight; reduced spacing. Cleaned `goals-page.tsx` (removed healthFilter/badges). Added `heroImage?: string` to `GoalData` in `goal-utils.ts`.
3. **Life Vision Framework Page simplified to 5 sections** (deployed to https://intenteo.vercel.app):
   - Removed standalone: `PurposeDashboard`, `LifeAreasSection`, `LifeAreaEditModal`, `GoalsByVisionSection`, `PurposeReviewsSection`, `CreateLifeAreaDialog`.
   - `LifeArea` data still exists (seeded; used by Purpose dropdown + Visions) but no standalone management UI.
   - Purpose Reviews moved INTO `PurposeSection` card: reviewFrequency select (monthly/quarterly/annually), Last/Next Review dates, review-due badge, Add Review (random question + reflection), View/Delete history.
   - `Purpose` type gained `lastReviewedAt` (required) and `"annually"` frequency. Added `REVIEW_FREQUENCY_CONFIG`, `REVIEW_QUESTIONS`, `randomReviewQuestion`, `getNextReviewDate`, `isReviewDue` in `vision-framework.ts` (imports `formatDateDDMMYYYY` from `@/lib/date-utils`).
   - `VisionsSection` shows clickable goal count (routes to `/goals` via `useRouter`) + milestone count; takes `milestones: RoadmapMilestone[]` prop fed by `roadmapMilestones` state (`loadRoadmapMilestones()`).
   - Page spacing `space-y-12`; render is 5 sections: Purpose, Core Values, Commitments, My Visions, Long-Term Milestones.

### Edit-tool note
Bulk `edit` calls matching very large blocks sometimes reported success WITHOUT changing the file. If an edit silently fails, re-read the exact current text and re-apply the targeted edit; verify removals with `Select-String` afterwards.

## Critical Context

- Project path: `C:\Users\HP\Documents\WEBSITES\INTENTEO`
- Vercel deploy: `npx vercel --yes --prod --scope john-favourite` (use `vercel_*` MCP tools instead of token)
- Production URL: https://intenteo.vercel.app
- localStorage keys: `intenteo-goals`, `intenteo-projects`, `intenteo-habits`, `intenteo-habits-period`, `intenteo-habits-view`, `intenteo-vision`

## Commitments Section Refinement (COMPLETE, deployed)

All 12 requirements delivered:

1. **Searchable Life Areas multi-select** — click-to-open dropdown, type-to-filter, multiple selection, branded chips with X to remove; same `DEFAULT_LIFE_AREAS` library as Purpose section
2. **Searchable Visions multi-select** — same pattern; "No visions available. Create a vision first." when empty
3. **Simplified cards** — removed "Keeping Consistently" badge, removed status badge; statement is the visual focus
4. **Clean value chips** — no icon, no star, no sparkle; branded uppercase chip only
5. **Filter in header** — moved to header controls (next to Add button), only visible when section expanded
6. **Pin Commitment** — pin/unpin with hover reveal; max 5 pinned with limit message
7. **Max 5 pinned** — enforced with dismissible notification
8. **Pinned-first sort** — pinned first, then most recently edited, then alphabetical
9. **Subtle pin icon** — small indigo pin in top-right corner, tooltip "Pinned Commitment"; no backgrounds/ribbons/badges
10. **Animate pinning** — smooth reorder via React key-based re-render (CSS transitions on cards)
11. **Preserve functionality** — creation, editing, deleting, all relationships preserved
12. **Design principles** — minimal, calm, reflection-oriented, easy to scan

### Components updated
- `CommitmentsSection` (visions-page.tsx) — rewritten with pin support, header filter, simplified cards
- `CommitmentEditModal` (visions-page.tsx) — searchable multi-selects for Life Areas and Visions
- `CreateCommitmentDialog` (visions-page.tsx) — searchable multi-selects for Life Areas and Visions
- `vision-framework.ts` — `Commitment` interface gained `pinned: boolean`; seed data includes `pinned: false`

### Additional fixes during this session
- Restored missing components: `LifeAreasSection`, `LifeAreaEditModal`, `PurposeDashboard`, `GoalsByVisionSection`, `PurposeReviewsSection`
- Added `useRouter` import from `next/navigation`
- Fixed `Purpose.lastReviewedAt` required field in default state and handleSave
- Fixed `savePurpose` return type (void vs Purpose)
