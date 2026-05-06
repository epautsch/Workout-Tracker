import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BottomNav, type TabName } from './components/BottomNav';
import { db } from './db/database';
import { seedExercises } from './db/seed';
import { useExercises, useSessions } from './hooks/useLive';
import type { Exercise, MuscleGroup, WorkoutSet } from './types/models';
import { exportAllCsv } from './utils/csv';
import { createId } from './utils/id';

const groups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio', 'Other'];

type DraftSet = Pick<WorkoutSet, 'reps' | 'weight' | 'isWarmup' | 'completed' | 'notes'>;

export default function App() {
  const [tab, setTab] = useState<TabName>('Dashboard');
  const [exerciseName, setExerciseName] = useState('');
  const [group, setGroup] = useState<MuscleGroup>('Other');
  const [search, setSearch] = useState('');
  const [sessionName, setSessionName] = useState('Workout Session');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [inlineExerciseName, setInlineExerciseName] = useState('');
  const [draftSets, setDraftSets] = useState<DraftSet[]>([]);
  const [error, setError] = useState('');

  const exercises = useExercises() ?? [];
  const sessions = useSessions() ?? [];

  useEffect(() => {
    void seedExercises();
  }, []);

  const filteredExercises = useMemo(() => exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscleGroup.toLowerCase().includes(search.toLowerCase())), [exercises, search]);
  const totalVolume = useMemo(() => draftSets.reduce((s, x) => s + x.reps * x.weight, 0), [draftSets]);

  const addExercise = async (name: string, muscleGroup: MuscleGroup) => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    await db.exercises.add({
      id: createId(),
      name: name.trim(),
      muscleGroup,
      createdAt: now,
      updatedAt: now
    });
  };

  const addSet = () => setDraftSets((p) => [...p, { reps: 8, weight: 0, completed: true, isWarmup: false, notes: '' }]);
  const removeSet = (idx: number) => setDraftSets((p) => p.filter((_, i) => i !== idx));

  const saveSession = async () => {
    setError('');
    if (!selectedExercise) return setError('Please select an exercise.');
    if (!draftSets.length) return setError('Please add at least one set.');
    const now = new Date().toISOString();
    const sid = createId();
    const seId = createId();

    await db.transaction('rw', db.sessions, db.sessionExercises, db.sets, async () => {
      await db.sessions.add({ id: sid, name: sessionName.trim() || 'Workout Session', date: sessionDate, notes: sessionNotes, createdAt: now, updatedAt: now });
      await db.sessionExercises.add({ id: seId, sessionId: sid, exerciseId: selectedExercise, order: 1, createdAt: now, updatedAt: now });
      await db.sets.bulkAdd(
        draftSets.map((s, i) => ({
          id: createId(),
          sessionExerciseId: seId,
          setNumber: i + 1,
          reps: Math.max(0, s.reps),
          weight: Math.max(0, s.weight),
          isWarmup: Boolean(s.isWarmup),
          notes: s.notes?.trim() ?? '',
          completed: Boolean(s.completed),
          createdAt: now,
          updatedAt: now
        }))
      );
    });

    setDraftSets([]);
    setSessionNotes('');
    setSelectedExercise('');
    setTab('History');
  };

  const deleteSession = async (id: string) => {
    const ses = await db.sessionExercises.where('sessionId').equals(id).toArray();
    await db.transaction('rw', db.sessions, db.sessionExercises, db.sets, async () => {
      for (const se of ses) {
        await db.sets.where('sessionExerciseId').equals(se.id).delete();
      }
      await db.sessionExercises.where('sessionId').equals(id).delete();
      await db.sessions.delete(id);
    });
  };

  return (
    <div className='app'>
      <header><h1>Workout Tracker</h1></header>
      <main>
        {tab === 'Dashboard' && <section className='card'><h2>Quick Stats</h2><p>Total sessions: {sessions.length}</p><p>Exercises tracked: {exercises.length}</p><p>Current draft volume: {totalVolume}</p><button onClick={() => setTab('Session')}>Start new session</button></section>}

        {tab === 'Exercises' && <section className='card'><h2>Exercises</h2><div className='row'><input value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} placeholder='Exercise name' /><select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>{groups.map((g) => <option key={g}>{g}</option>)}</select><button onClick={() => void addExercise(exerciseName, group).then(() => setExerciseName(''))}>Add</button></div><input placeholder='Search by name or muscle group' value={search} onChange={(e) => setSearch(e.target.value)} />{filteredExercises.map((e: Exercise) => <div className='item' key={e.id}><strong>{e.name}</strong><span>{e.muscleGroup}</span></div>)}</section>}

        {tab === 'Session' && <section className='card'><h2>New Session</h2>{error && <p className='error'>{error}</p>}<input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder='Session name' /><input type='date' value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} /><textarea value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} placeholder='Notes (optional)' /><select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}><option value=''>Select exercise</option>{exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select><div className='row'><input value={inlineExerciseName} onChange={(e) => setInlineExerciseName(e.target.value)} placeholder='Create exercise inline' /><button onClick={() => void addExercise(inlineExerciseName, group).then(() => setInlineExerciseName(''))}>Create</button></div><button onClick={addSet}>Add Set</button>{draftSets.map((s, idx) => <div className='set-card' key={idx}><div className='row'><input type='number' value={s.reps} onChange={(e) => setDraftSets((p) => p.map((x, i) => i === idx ? { ...x, reps: Number(e.target.value) } : x))} placeholder='Reps' /><input type='number' value={s.weight} onChange={(e) => setDraftSets((p) => p.map((x, i) => i === idx ? { ...x, weight: Number(e.target.value) } : x))} placeholder='Weight' /></div><div className='row'><label><input type='checkbox' checked={Boolean(s.isWarmup)} onChange={(e) => setDraftSets((p) => p.map((x, i) => i === idx ? { ...x, isWarmup: e.target.checked } : x))} /> Warm-up</label><label><input type='checkbox' checked={Boolean(s.completed)} onChange={(e) => setDraftSets((p) => p.map((x, i) => i === idx ? { ...x, completed: e.target.checked } : x))} /> Completed</label></div><input value={s.notes ?? ''} onChange={(e) => setDraftSets((p) => p.map((x, i) => i === idx ? { ...x, notes: e.target.value } : x))} placeholder='Set notes (optional)' /><button className='danger' onClick={() => removeSet(idx)}>Remove Set</button></div>)}<p>Volume: {totalVolume}</p><button onClick={() => void saveSession()}>Save Session</button></section>}

        {tab === 'History' && <section className='card'><h2>History</h2>{sessions.map((s) => <div className='item' key={s.id}><div><strong>{s.name}</strong><div>{s.date}</div></div><button className='danger' onClick={() => void deleteSession(s.id)}>Delete</button></div>)}</section>}

        {tab === 'Progress' && <Progress exercises={exercises} />}
        {tab === 'Export' && <section className='card'><h2>Export CSV</h2><button onClick={() => void exportAllCsv()}>Download CSV files</button></section>}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function Progress({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState('');
  const [points, setPoints] = useState<Array<{ date: string; max: number; volume: number; orm: number }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return setPoints([]);
      const ses = await db.sessionExercises.where('exerciseId').equals(exerciseId).toArray();
      const data: Array<{ date: string; max: number; volume: number; orm: number }> = [];
      for (const se of ses) {
        const session = await db.sessions.get(se.sessionId);
        const sets = await db.sets.where('sessionExerciseId').equals(se.id).toArray();
        const max = Math.max(...sets.map((x) => x.weight), 0);
        const volume = sets.reduce((s, x) => s + x.weight * x.reps, 0);
        const orm = Math.max(...sets.map((x) => x.weight * (1 + x.reps / 30)), 0);
        data.push({ date: session?.date ?? '', max, volume, orm: Number(orm.toFixed(2)) });
      }
      setPoints(data.sort((a, b) => a.date.localeCompare(b.date)));
    };
    void load();
  }, [exerciseId]);

  return <section className='card'><h2>Progress</h2><select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}><option value=''>Select exercise</option>{exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select><div style={{ height: 220 }}><ResponsiveContainer><LineChart data={points}><XAxis dataKey='date' /><YAxis /><Tooltip /><Line dataKey='max' stroke='#4f46e5' name='Max Weight' /><Line dataKey='volume' stroke='#10b981' name='Volume' /><Line dataKey='orm' stroke='#f59e0b' name='Est 1RM' /></LineChart></ResponsiveContainer></div></section>;
}
