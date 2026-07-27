import { HashRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Exercises from './pages/Exercises'
import ExerciseDetail from './pages/ExerciseDetail'
import Routines from './pages/Routines'
import RoutineEditor from './pages/RoutineEditor'
import Workout from './pages/Workout'
import WorkoutSession from './pages/WorkoutSession'
import History from './pages/History'
import SessionDetail from './pages/SessionDetail'
import Program from './pages/Program'
import ProgramMonth from './pages/ProgramMonth'
import ProgramsList from './pages/ProgramsList'

function Shell() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Exercises />} />
          <Route path="/ejercicio/:id" element={<ExerciseDetail />} />
          <Route path="/programas" element={<ProgramsList />} />
          <Route path="/programas/:programId" element={<Program />} />
          <Route path="/programas/:programId/mes/:month" element={<ProgramMonth />} />
          <Route path="/rutinas" element={<Routines />} />
          <Route path="/rutinas/nueva" element={<RoutineEditor />} />
          <Route path="/rutinas/:id" element={<RoutineEditor />} />
          <Route path="/entrenar" element={<Workout />} />
          <Route path="/entrenar/:sessionId" element={<WorkoutSession />} />
          <Route path="/historial" element={<History />} />
          <Route path="/historial/:sessionId" element={<SessionDetail />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
