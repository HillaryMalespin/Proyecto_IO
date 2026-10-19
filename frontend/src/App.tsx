import { Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import Mochila from './pages/Mochila'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/mochila" element={<Mochila />} />
      {/* Proyectos 1-5: aquí agreguen las paginas cuando la implementen */}
    </Routes>
  )
}