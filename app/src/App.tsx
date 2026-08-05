import { useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
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
import MeasurementTrend from './pages/MeasurementTrend'
import Kegel from './pages/Kegel'
import KegelSession from './pages/KegelSession'
import KegelTest from './pages/KegelTest'
import KegelTrend from './pages/KegelTrend'
import Profile from './pages/Profile'

// Las sesiones guiadas van a pantalla completa: el menú distrae del ritmo y
// facilita salirse de la rutina sin querer.
const IMMERSIVE_ROUTES = ['/kegel/rutina', '/kegel/test']

function Shell() {
  const { pathname } = useLocation()
  const immersive = IMMERSIVE_ROUTES.includes(pathname)

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
          <Route path="/medidas/grafico/:key" element={<MeasurementTrend />} />
          <Route path="/medidas/:id" element={<MeasurementForm />} />
          <Route path="/kegel" element={<Kegel />} />
          <Route path="/kegel/rutina" element={<KegelSession />} />
          <Route path="/kegel/test" element={<KegelTest />} />
          <Route path="/kegel/progreso" element={<KegelTrend />} />
          <Route path="/ajustes" element={<Profile />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </main>
      {!immersive && <BottomNav />}
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
