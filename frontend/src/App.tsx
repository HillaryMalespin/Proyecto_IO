import { Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      {/* Proyectos 1-5: aquí agreguen las paginas cuando la implementen */}
    </Routes>
  )
}