import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../pagina.css'

interface Props {
  titulo: string
  subtitulo?: string
  children: ReactNode
}

/** Marco común de todas las pantallas de algoritmos (Proyectos 1 al 5). */
export default function PaginaAlgoritmo({ titulo, subtitulo, children }: Props) {
  return (
    <main className="pagina">
      <header className="pagina-cabecera">
        <Link to="/" className="volver">Volver al menú</Link>
        <h1><span>{titulo}</span></h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      </header>
      {children}
    </main>
  )
}
