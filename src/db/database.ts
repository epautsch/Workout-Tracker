import Dexie, { type Table } from 'dexie';
import type { Exercise, SessionExercise, WorkoutSession, WorkoutSet } from '../types/models';

export class WorkoutTrackerDB extends Dexie {
  exercises!: Table<Exercise, string>;
  sessions!: Table<WorkoutSession, string>;
  sessionExercises!: Table<SessionExercise, string>;
  sets!: Table<WorkoutSet, string>;

  constructor() {
    super('workout-tracker-db');
    this.version(1).stores({
      exercises: 'id, name, muscleGroup, updatedAt',
      sessions: 'id, date, updatedAt',
      sessionExercises: 'id, sessionId, exerciseId, order',
      sets: 'id, sessionExerciseId, setNumber, completed'
    });
  }
}

export const db = new WorkoutTrackerDB();
