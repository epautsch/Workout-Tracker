import { db } from '../db/database';

type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

const toCsv = <T extends object>(rows: T[]) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0] as object);
  const esc = (v: CsvValue) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    headers.join(','),
    ...rows.map((row) => {
      const mapped = row as unknown as CsvRow;
      return headers.map((header) => esc(mapped[header])).join(',');
    })
  ].join('\n');
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
