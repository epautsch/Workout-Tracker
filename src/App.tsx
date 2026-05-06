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

export default function App() {
  const [tab, setTab] = useState<TabName>('Dashboard');
  const [exerciseName, setExerciseName] = useState('');
  const [group, setGroup] = useState<MuscleGroup>('Other');
  const [sessionName, setSessionName] = useState('Workout Session');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedExercise, setSelectedExercise] = useState('');
  const [draftSets, setDraftSets] = useState<Array<Pick<WorkoutSet,'reps'|'weight'|'isWarmup'|'completed'|'notes'>>> ([]);
  const exercises = useExercises() ?? [];
  const sessions = useSessions() ?? [];

  useEffect(() => { void seedExercises(); }, []);

  const totalVolume = useMemo(() => draftSets.reduce((s, x) => s + x.reps * x.weight, 0), [draftSets]);

  const addExercise = async () => {
    if (!exerciseName.trim()) return;
    const now = new Date().toISOString();
    await db.exercises.add({ id: createId(), name: exerciseName.trim(), muscleGroup: group, createdAt: now, updatedAt: now });
    setExerciseName('');
  };

  const addSet = () => setDraftSets((p) => [...p, { reps: 8, weight: 0, completed: true, isWarmup: false, notes: '' }]);

  const saveSession = async () => {
    if (!selectedExercise) return;
    const now = new Date().toISOString();
    const sid = createId();
    const seId = createId();
    await db.sessions.add({ id: sid, name: sessionName, date: sessionDate, notes: '', createdAt: now, updatedAt: now });
    await db.sessionExercises.add({ id: seId, sessionId: sid, exerciseId: selectedExercise, order: 1, createdAt: now, updatedAt: now });
    await db.sets.bulkAdd(draftSets.map((s, i) => ({ id: createId(), sessionExerciseId: seId, setNumber: i + 1, reps: s.reps, weight: s.weight, isWarmup: s.isWarmup, notes: s.notes, completed: s.completed, createdAt: now, updatedAt: now })));
    setDraftSets([]);
    setTab('History');
  };

  return <div className='app'>{/* simplified for brevity */}
    <header><h1>Workout Tracker</h1></header>
    <main>
      {tab === 'Dashboard' && <section className='card'><h2>Quick Stats</h2><p>Total sessions: {sessions.length}</p><p>Exercises tracked: {exercises.length}</p><button onClick={()=>setTab('Session')}>Start new session</button></section>}
      {tab === 'Exercises' && <section className='card'><h2>Exercises</h2><div className='row'><input value={exerciseName} onChange={(e)=>setExerciseName(e.target.value)} placeholder='Exercise name'/><select value={group} onChange={(e)=>setGroup(e.target.value as MuscleGroup)}>{groups.map(g=><option key={g}>{g}</option>)}</select><button onClick={addExercise}>Add</button></div>{exercises.map((e:Exercise)=><div className='item' key={e.id}><strong>{e.name}</strong><span>{e.muscleGroup}</span></div>)}</section>}
      {tab === 'Session' && <section className='card'><h2>New Session</h2><input value={sessionName} onChange={(e)=>setSessionName(e.target.value)} /><input type='date' value={sessionDate} onChange={(e)=>setSessionDate(e.target.value)} /><select value={selectedExercise} onChange={(e)=>setSelectedExercise(e.target.value)}><option value=''>Select exercise</option>{exercises.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><button onClick={addSet}>Add Set</button>{draftSets.map((s,idx)=><div className='row' key={idx}><input type='number' value={s.reps} onChange={(e)=>setDraftSets(p=>p.map((x,i)=>i===idx?{...x,reps:Number(e.target.value)}:x))}/><input type='number' value={s.weight} onChange={(e)=>setDraftSets(p=>p.map((x,i)=>i===idx?{...x,weight:Number(e.target.value)}:x))}/></div>)}<p>Volume: {totalVolume}</p><button onClick={saveSession}>Save Session</button></section>}
      {tab === 'History' && <section className='card'><h2>History</h2>{sessions.map(s=><div className='item' key={s.id}><strong>{s.name}</strong><span>{s.date}</span></div>)}</section>}
      {tab === 'Progress' && <Progress exercises={exercises} />}
      {tab === 'Export' && <section className='card'><h2>Export CSV</h2><button onClick={() => void exportAllCsv()}>Download CSV files</button></section>}
    </main>
    <BottomNav active={tab} onChange={setTab} />
  </div>;
}

function Progress({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState('');
  const [points, setPoints] = useState<Array<{ date: string; max: number; volume: number }>>([]);
  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return setPoints([]);
      const ses = await db.sessionExercises.where('exerciseId').equals(exerciseId).toArray();
      const data: Array<{ date: string; max: number; volume: number }> = [];
      for (const se of ses) {
        const session = await db.sessions.get(se.sessionId);
        const sets = await db.sets.where('sessionExerciseId').equals(se.id).toArray();
        data.push({ date: session?.date ?? '', max: Math.max(...sets.map((x) => x.weight), 0), volume: sets.reduce((s, x) => s + x.weight * x.reps, 0) });
      }
      setPoints(data.sort((a,b)=>a.date.localeCompare(b.date)));
    };
    void load();
  }, [exerciseId]);
  return <section className='card'><h2>Progress</h2><select value={exerciseId} onChange={(e)=>setExerciseId(e.target.value)}><option value=''>Select exercise</option>{exercises.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><div style={{height:220}}><ResponsiveContainer><LineChart data={points}><XAxis dataKey='date'/><YAxis/><Tooltip/><Line dataKey='max' stroke='#4f46e5'/><Line dataKey='volume' stroke='#10b981'/></LineChart></ResponsiveContainer></div></section>;
}
