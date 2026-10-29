import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { algoritmos, type Algoritmo } from '../algoritmos'
import { useHealth } from '../hooks/useHealth'
import TablaDP from '../components/TablaDP'

const TEXTO_ESTADO = {
  verificando: 'Verificando servicio…',
  activo: 'Servicio activo',
  inactivo: 'Servicio no disponible. Inicie el backend e intente de nuevo.',
}

interface Props {
  opciones?: Algoritmo[]
}

export default function Menu({ opciones = algoritmos }: Props) {
  const navigate = useNavigate()
  const estado = useHealth()
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const abrir = (a: Algoritmo) => {
    if (!a.disponible) {
      setAviso(`"${a.nombre}" aún no está disponible.`)
      return
    }
    setAviso(null)
    navigate(a.ruta)
  }

  return (
    <main className="menu">
      <header className="cabecera">
        <TablaDP />
        <div className="titulos">
          <h1><span>Programación Dinámica</span></h1>
          <p className="subtitulo">Elija el problema que desea resolver.</p>
        </div>
        <p className={`estado estado-${estado}`} role="status">
          <span className="punto" aria-hidden="true" />
          {TEXTO_ESTADO[estado]}
        </p>
      </header>

      <nav aria-label="Algoritmos">
        <ul className="rejilla">
          {opciones.map((a) => (
            <li className="opcion" key={a.id}>
              <button className="tarjeta" aria-describedby={`tip-${a.id}`} onClick={() => abrir(a)}>
                <span className="tarjeta-nombre">{a.nombre}</span>
                {!a.disponible && <span className="insignia">Próximamente</span>}
              </button>
              <span role="tooltip" id={`tip-${a.id}`} className="tooltip">
                {a.descripcion}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      {aviso && <div className="aviso" role="alert">{aviso}</div>}
    </main>
  )
}