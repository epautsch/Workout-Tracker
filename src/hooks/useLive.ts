import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export const useExercises = () => useLiveQuery(() => db.exercises.orderBy('name').toArray(), []);
export const useSessions = () => useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []);
