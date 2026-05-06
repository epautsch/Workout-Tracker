import { db } from '../db/database';

const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
};

const download = (name: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAllCsv = async () => {
  const [exercises, sessions, sessionExercises, sets] = await Promise.all([
    db.exercises.toArray(),
    db.sessions.toArray(),
    db.sessionExercises.toArray(),
    db.sets.toArray()
  ]);
  download('exercises.csv', toCsv(exercises));
  download('sessions.csv', toCsv(sessions));
  download('session_exercises.csv', toCsv(sessionExercises));
  download('sets.csv', toCsv(sets));
};
