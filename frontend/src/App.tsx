import { Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import Mochila from './pages/Mochila'
import SeriesDeportivas from './pages/SeriesDeportivas'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/mochila" element={<Mochila />} />
      <Route path="/series-deportivas" element={<SeriesDeportivas />} />
      {/* Proyectos 1-5: aquí agreguen las paginas cuando la implementen */}
    </Routes>
  )
}