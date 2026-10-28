import { Navigate, Route, Routes } from 'react-router-dom'
import Menu from './pages/Menu'
import Reemplazo from './pages/Reemplazo'
import Mochila from './pages/Mochila'
import SeriesDeportivas from './pages/SeriesDeportivas'
import Matrices from './pages/Matrices'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/reemplazo-equipos" element={<Reemplazo />} />
      <Route path="/mochila" element={<Mochila />} />
      <Route path="/series-deportivas" element={<SeriesDeportivas />} />
      <Route path="/multiplicacion-matrices" element={<Matrices />} />
      {/* Proyectos se agregan */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
