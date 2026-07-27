import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Splash from './components/Splash'
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
import Measurements from './pages/Measurements'
import MeasurementForm from './pages/MeasurementForm'
import Profile from './pages/Profile'

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
          <Route path="/medidas" element={<Measurements />} />
          <Route path="/medidas/nueva" element={<MeasurementForm />} />
          <Route path="/medidas/:id" element={<MeasurementForm />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  return (
    <HashRouter>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <Shell />
    </HashRouter>
  )
}
