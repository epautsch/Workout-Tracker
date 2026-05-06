# Workout Tracker (Local-First MVP)

React + TypeScript + Vite workout tracker optimized for mobile, fully local using IndexedDB (Dexie).

## Features
- Local-only data: exercises, sessions, session_exercises, and sets.
- Offline-first behavior with IndexedDB persistence.
- Mobile-first UI with bottom navigation and touch-friendly controls.
- Exercise creation + search + inline creation in session flow.
- Session creation with notes, set add/remove, warm-up/completed toggles.
- Progress charts: max weight, total volume, estimated 1RM.
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

## Install on Android Pixel
1. Run `npm run build` and deploy the `dist/` folder to any HTTPS static host (or use local LAN hosting while testing).
2. Open the app URL in Chrome on your Pixel.
3. Tap the browser menu (⋮) and choose **Add to Home screen** (or **Install app** if shown).
4. Launch from home screen; it runs standalone like an app.
5. Keep using the same browser profile to retain IndexedDB data.

## Future-ready extension ideas
- Introduce repository/service layer abstractions for remote sync.
- Add auth and multi-device merge strategy.
- Add templates, bodyweight tracking, PR tracking, and CSV import.
