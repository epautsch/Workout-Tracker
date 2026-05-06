# Workout Tracker (Local-First MVP)

React + TypeScript + Vite workout tracker optimized for mobile, fully local using IndexedDB (Dexie).

## Features
- Local-only data: exercises, sessions, session_exercises, and sets.
- Offline-first behavior with IndexedDB persistence.
- Mobile-first UI with bottom navigation and touch-friendly controls.
- Exercise management and seeded starter exercises.
- Session creation with per-set reps/weight tracking.
- Progress chart (max weight + total volume over time).
- CSV export of all core entities.
- PWA manifest included for installability baseline.

## Install & run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Notes on local storage
- Data is stored in browser/device IndexedDB database `workout-tracker-db`.
- No login, no backend, no cloud sync in v1.
- Exports generate 4 files: `exercises.csv`, `sessions.csv`, `session_exercises.csv`, `sets.csv`.

## Future-ready extension ideas
- Introduce repository/service layer abstractions for remote sync.
- Add auth and multi-device merge strategy.
- Add templates, bodyweight tracking, PRs, and CSV import.
