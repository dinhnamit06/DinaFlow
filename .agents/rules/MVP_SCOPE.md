# BioSaaS MVP Scope

## Purpose

BioSaaS is a bio-driven productivity app that helps users turn work sessions into small, rewarded actions while keeping a lightweight record of recovery habits.

The first MVP should be a complete responsive website before any native mobile app work starts. The website should prove the core loop:

1. Create a small task.
2. Complete a focused work session.
3. Earn Dopamine Coins.
4. Spend coins on a self-defined reward.
5. Log recovery activities.
6. View a simple health and productivity summary.

## Primary Delivery Target

- First product surface: responsive web app.
- Desktop browser must feel complete and polished first.
- Mobile browser should be usable through responsive layout.
- Native Flutter/mobile apps are deferred until the website experience is stable.

## Target User

- Student working under deadline pressure.
- Beginner developer or freelancer managing self-study and project work.
- User who wants a playful but disciplined alternative to a normal to-do list.

## MVP In Scope

### Responsive Website

- A complete web experience with clear navigation and polished screens.
- Core pages: Dashboard, Tasks, Timer, Rewards, Bio Logs, and Settings/Profile placeholder.
- Website-first UX should prioritize fast daily use: create task, start focus, complete, earn coins, redeem reward, and log recovery.
- Mobile browser layout should be supported, but native mobile APIs are not part of this step.

### Micro-Tasks

- Create, edit, delete, and complete tasks.
- Each task has a title, optional description, estimated duration, reward coin value, and status.
- MVP duration rule: tasks should be short, preferably 45 minutes or less.
- Completion should be idempotent: completing the same task twice must not grant coins twice.

### Pomodoro Session

- Start a timer for a task.
- Mark the task complete when the session ends.
- Store completion time.
- A simple timer is enough for MVP; advanced session analytics can wait.

### Dopamine Wallet

- Every user has a coin balance.
- Completing a task increases the balance by the task reward.
- Spending on a reward decreases the balance.
- The system must prevent negative balances.

### Reward Vault

- Create rewards such as "15 minutes TikTok" or "one movie night".
- Each reward has a cost.
- A user can redeem a reward only if they have enough coins.
- MVP redemption can be a simple record. Native app blocking is not required yet.

### Bio Logs

- Log recovery activities for Endorphin, Oxytocin, and Serotonin.
- Each log stores hormone type, activity name, points earned, and created time.
- MVP can use manual input only.

### Simple Dashboard

- Show task completion count.
- Show current Dopamine Coin balance.
- Show recent Bio Logs.
- Show a basic Burnout Risk Index placeholder using available activity and spending data.

## Out Of Scope For MVP

- Native Flutter app.
- Native Android app.
- Native iOS app.
- Native Android Accessibility Service app blocking.
- iOS Screen Time integration.
- Real-time Duo-Sync.
- Couple interactions and haptic patterns.
- AI prediction model.
- Streamlit or Power BI dashboard.
- Offline-first sync with Hive or Isar.
- Push notifications.
- Payments or subscriptions.

## Phase 2 Candidates

- Backend hardening after the website flow is proven.
- Duo-Sync with Socket.io.
- Shared streaks.
- Real-time encouragement pings.
- Offline-first local storage.
- More detailed Burnout Risk Index calculations.

## Phase 3 Candidates

- Native Flutter/mobile app based on the validated website experience.
- Native App Blocker.
- AI-assisted burnout prediction.
- Production deployment.
- Premium subscription model.

## Core Data Entities

### User

- id
- username
- email
- password_hash
- dopa_balance
- baseline_energy
- created_at
- updated_at

### MicroTask

- id
- user_id
- title
- description
- duration_minutes
- reward_dopa
- status
- completed_at
- created_at
- updated_at

### BioLog

- id
- user_id
- hormone_type
- activity_name
- points_earned
- created_at

### Reward

- id
- user_id
- reward_name
- dopa_cost
- is_redeemed
- redeemed_at
- created_at
- updated_at

## Recommended First Technical Slice

Build the website shell first because the product experience needs to feel complete before moving to phone apps.

1. Initialize a web app.
2. Build the main app layout and navigation.
3. Add Dashboard, Tasks, Timer, Rewards, Bio Logs, and Settings/Profile placeholder screens.
4. Use local mock data first to validate the user flow quickly.
5. Add local product rules for task completion, wallet balance, reward redemption, and bio logs.
6. After the web UX passes, introduce backend/API persistence.

## Acceptance Criteria

- The website opens to a usable app screen, not a marketing landing page.
- The website is responsive for desktop and mobile browser widths.
- A user can create a micro-task.
- A user can complete that task.
- Completion adds coins exactly once.
- A user can create a reward.
- A user cannot redeem a reward with insufficient coins.
- A user can add a bio log.
- The dashboard endpoint returns wallet balance, completed task count, and recent bio logs.

## Main Risks

- The full DOCX scope is larger than an MVP, especially App Blocker, Duo-Sync, offline sync, and AI prediction.
- Building native mobile too early would slow down iteration before the product loop is proven.
- Native app blocking has platform-specific restrictions and should be isolated from the main backend.
- Burnout prediction should start as transparent rules before using AI.
- Offline-first sync should come after online flows are stable.
