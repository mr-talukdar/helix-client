# HeliX — Architectural Improvements & Future Plans

The current architecture (Next.js + Supabase + 4-Layer Separation + Redis/BullMQ AI Agents) is highly robust for a v1 launch. However, to truly fulfill the vision of an **uninterrupted mobile gym experience** and a **massively scalable AI copilot**, we need to plan for the next level of architectural maturity.

Here are the highest-impact architectural improvements and upgrade paths for HeliX.

---

## 1. The Monorepo Transition (Turborepo)

Currently, the Core Decision Engine lives inside the `helix-client` Next.js app. To guarantee it can be reused across a future React Native/Expo app and separate AI Worker microservices, the repository MUST be split into a **Monorepo**.

**Proposed Structure:**
```
helix-monorepo/
├── apps/
│   ├── web/               # Next.js web application
│   ├── mobile/            # Expo / React Native mobile app (future)
│   └── ai-workers/        # Node.js/Python BullMQ workers (future)
│
├── packages/
│   ├── engine/            # The Core Decision Engine (pure TypeScript)
│   ├── database/          # Supabase types, migrations, and Edge Functions
│   ├── ui/                # Shared React components (shadcn ui) usable on web
│   └── config/            # Shared ESLint, TSConfig, Prettier
```

**Why do this early?**
Extracting the `engine/` folder into `packages/engine/` forces strict boundary compliance. It mathematically proves the engine has zero dependencies on Next.js or React.

---

## 2. True Local-First Architecture (Offline Sync)

Currently, we back up active workouts to `localStorage`. This works for a dropped connection *during* a workout, but it doesn't solve poor gym basement signal *before* starting a workout.

**The Improvement:** Implement a robust **Local-First Sync Engine**.
- **Options:** [PowerSync](https://www.powersync.com/) (works natively with Supabase) or **WatermelonDB**.
- **How it works:** 
  1. The Data Access Layer uses a local SQLite database on the device (via WASM on web, native SQLite on mobile).
  2. All reads/writes happen **instantly** against the local database (0ms latency).
  3. A background sync worker continuously replicates local changes up to Supabase and pulls remote changes down via logical replication.
- **Result:** HeliX works 100% offline indefinitely. If a user is offline for 3 days, their PRs, history, and gym leaderboard standing sync immediately upon reconnecting to Wi-Fi.

---

## 3. Caching Layer for Leaderboards (Redis / CDN)

The current SQL aggregation for the Gym Leaderboard (`SUM(progress_score) GROUP BY user_id`) is highly efficient, but if a gym has 5,000 members and they all open the app at 5:00 PM, running that aggregation on every page load will bottleneck Postgres.

**The Improvement:**
- Implement a **Redis Cache** (Upstash is perfect for serverless).
- **Strategy:**
  - The API Route queries Redis for `gym_leaderboard:gym_123`.
  - If a cache miss occurs, the API queries Supabase, calculates the leaderboard, and writes it to Redis with a **TTL of 1 hour** (or 5 minutes).
  - **Event-Driven Invalidation:** When a new `progress_event` is inserted, publish a message to invalidate or update the Redis cache for that specific gym.

---

## 4. Event Sourcing for the Gym Feed

Currently, we insert rows into an `activity_events` table. While standard, deleting or updating past events (e.g., if a user accidentally logged 1000kg and deleted the set) can cause race conditions or orphan data in the feed.

**The Improvement:** Use an **Event Sourcing** pattern for gym activity.
- Instead of treating the database as the "current state", treat it as an append-only log of immutable facts.
- **Events:** `WorkoutStarted`, `SetCompleted_PR_Broken`, `WorkoutFinished_Invalidated`.
- **Projection:** A background worker (Supabase Edge Function or Database Trigger) replays these events to build a materialized view (`gym_feed_view`).
- **Benefit:** If logic changes (e.g., we decide only PRs > 5% get broadcasted), we can wipe the materialized view and recalculate the entire history of the feed perfectly from the raw event stream.

---

## 5. Gamification & Achievements Engine

The Core Decision Engine currently has a `ProgressEngine`. We should introduce an autonomous **Rules Engine** (like [json-rules-engine](https://github.com/CacheControl/json-rules-engine)).

**Why?**
- Hardcoding achievement logic (`if (workouts > 100) return 'CenturionBadg'`) creates spaghetti code.
- By defining rules in JSON, we can dynamically add new challenges (e.g., "Complete 3 leg days this week") directly into the database without touching application code.
- The Engine reads the active rules from the DB, runs the user's latest `progress_events` through the rules engine, and emits `achievement.unlocked` events.

---

## 6. Comprehensive Telemetry & Observability

If the AI agents are making decisions, we need to know exactly *why* they made them.

**The Improvement:**
1. **Product Analytics:** Plausible Analytics or PostHog to track *where* users drop off in the workout logger.
2. **Error Tracking:** Sentry initialized in the Next.js `_app` and inside the Core Decision Engine. If a PR calculation throws an error, we need the exact stack trace and engine input state.
3. **AI Tracing:** (As mentioned in the Multi-Agent docs) **Langfuse** is critical. We need a dashboard that shows: *"User X got a terrible workout plan — show me the exact sequence of prompts, the fatigue score passed to the LLM, and the LLM's raw JSON output."*

---

## 7. Migration to Edge Run-times

Currently, the backend API is standard Node.js Serverless Functions in Next.js (Vercel).

**The Improvement:** Next.js Edge Runtime or Supabase Edge Functions.
- The Core Decision Engine is pure TypeScript. It has no Node.js built-in dependencies (`fs`, `crypto`, etc.).
- Therefore, we can deploy the `/api/workouts/finish` route to the **Vercel Edge Network** or **Cloudflare Workers**.
- **Benefit:** 0ms cold starts. The API executes globally near the user, ensuring the workout logging feels instant regardless of their distance to the primary database region.

---

## Summary of Priority Implementation

If prioritizing these improvements for the roadmap, execute them in this order:

1. **Turborepo Extraction** (Do this immediately before the codebase grows too large).
2. **Edge Run-time deployment** (Low effort, high performance reward).
3. **Redis Caching for Leaderboards** (Crucial before launching the Gym Ecosystem to hundreds of users).
4. **Local-First PowerSync/WatermelonDB** (High engineering effort, but necessary before launching the real iOS/Android mobile app).
