export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Arms'
  | 'Shoulders'
  | 'Core'
  | 'Cardio'
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  defaultSetCount?: number;
  defaultRepTarget?: number;
  defaultWeight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  isWarmup?: boolean;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionBundle {
  session: WorkoutSession;
  exercises: Array<{
    sessionExercise: SessionExercise;
    exercise: Exercise;
    sets: WorkoutSet[];
  }>;
}
