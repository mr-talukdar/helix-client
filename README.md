# HeliX

HeliX is a mobile-first workout tracking application designed to evolve into an **AI-powered gym copilot**.
The current version focuses on building a **fast, reliable workout logging and progress tracking system**.

Future versions will introduce intelligent features such as adaptive workout generation, training analysis, and AI coaching.

---

# Vision

HeliX aims to become a **training intelligence platform** that helps lifters train smarter by analyzing performance data and generating adaptive workout plans.

The long-term concept is:

**Your body is the machine. HeliX is the operating system.**

However, the first version focuses on solving the most important problem:

**making workout logging fast, simple, and useful.**

---

# Current Version (HeliX v1)

HeliX v1 is a **gym workout tracker** with the following core capabilities:

- Log workouts and exercises
- Record sets with weight and reps
- Track training progress
- Visualize strength trends with charts
- Track personal records
- Maintain workout history

This version intentionally avoids unnecessary complexity so development can move quickly.

---

# Tech Stack

Frontend

- Next.js
- React
- TailwindCSS
- shadcn/ui
- Radix UI components

UI / UX

- lucide-react icons
- sonner toast notifications
- react-hook-form
- zod validation

Data Visualization

- recharts

Utilities

- date-fns

The UI scaffold was generated using **v0.dev** and then customized.

---

# Backend (Planned)

The initial backend will use **Supabase**, which provides:

- Postgres database
- authentication
- API access
- scalable infrastructure

This allows development to move quickly without building a custom backend.

---

# Planned Database Schema

## Users

Stores user accounts.

Fields:

- id
- email
- created_at

---

## Exercises

List of exercises available in the app.

Fields:

- id
- name
- muscle_group

---

## Workouts

Represents a workout session.

Fields:

- id
- user_id
- created_at

---

## Workout Sets

Stores individual sets performed during workouts.

Fields:

- id
- workout_id
- exercise_id
- weight
- reps
- created_at

---

# Core Application Screens

## Dashboard

Displays:

- workout streak
- readiness summary (future feature)
- personal records
- today's workout

---

## Workout Logger

The central screen of the application.

Features:

- exercise cards
- set logging
- add exercise
- finish workout

Optimized for **fast logging during workouts**.

---

## Progress

Displays training analytics including:

- strength progression charts
- volume tracking
- personal records

---

## Profile

Displays:

- user information
- training goals
- body weight tracking
- account settings

---

# Future Direction

HeliX is designed to evolve into an **AI training system**.

Future capabilities may include:

- AI workout generation
- fatigue modeling
- adaptive training plans
- progress analysis
- coaching recommendations
- readiness scoring

These features may eventually use **AI services or multi-agent architectures**, but they are intentionally **not part of v1**.

The current focus is building a solid data foundation.

---

# Development Philosophy

HeliX follows a simple principle:

**Ship useful features early, evolve intelligence later.**

The development roadmap is:

Phase 1
Workout tracker

Phase 2
Training analytics

Phase 3
AI-assisted programming

Phase 4
AI gym copilot

---

# Getting Started

Install dependencies:

```
npm install
```

Run the development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Status

HeliX is currently in **early development**.

The frontend interface is functional and the next step is integrating a persistent backend and replacing mock data with real workout records.

---

# License

Private project – currently under development.
