import { db } from './database';
import { createId } from '../utils/id';
import type { Exercise, MuscleGroup } from '../types/models';

const seeds: Array<{ name: string; muscleGroup: MuscleGroup }> = [
  { name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { name: 'Flat Bench Press', muscleGroup: 'Chest' },
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Pull-up', muscleGroup: 'Back' },
  { name: 'Shoulder Press', muscleGroup: 'Shoulders' },
  { name: 'Bicep Curl', muscleGroup: 'Arms' },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms' },
  { name: 'Row', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' }
];

export const seedExercises = async () => {
  const count = await db.exercises.count();
  if (count > 0) return;
  const now = new Date().toISOString();
  const rows: Exercise[] = seeds.map((item) => ({
    id: createId(),
    name: item.name,
    muscleGroup: item.muscleGroup,
    createdAt: now,
    updatedAt: now
  }));
  await db.exercises.bulkAdd(rows);
};
