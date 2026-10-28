import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TablaMatrices from '../components/TablaMatrices'
import {
  MAX_MATRICES,
  MIN_MATRICES,
  aJson,
  cargarArchivo,
  formularioInicial,
  redimensionar,
  validarCantidad,
  validarFormulario,
  type ProblemaForm,
  type Resultado,
} from '../lib/matrices'

interface Aviso {
  tipo: 'error' | 'ok'
  texto: string
}

export default function Matrices() {
  const [formulario, setFormulario] = useState<ProblemaForm>(formularioInicial)
  const [intentado, setIntentado] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const validacion = validarFormulario(formulario)
  const errorCantidad = validarCantidad(formulario.cantidad)
  const cambiar = (nuevo: ProblemaForm) => {
    setFormulario(nuevo)
    setResultado(null)
    setAviso(null)
  }

  const cambiarCantidad = (valor: string) => {
    const numero = Number(valor)
    cambiar({
      cantidad: valor,
      dimensiones: /^\d+$/.test(valor) && numero >= MIN_MATRICES && numero <= MAX_MATRICES
        ? redimensionar(formulario.dimensiones, numero)
        : formulario.dimensiones,
    })
  }

  const resolver = async (evento: FormEvent) => {
    evento.preventDefault()
    setIntentado(true)
    if (!validacion.problema) {
      setAviso({ tipo: 'error', texto: 'Hay datos inválidos. Revise las dimensiones.' })
      return
    }
    setCargando(true)
    setAviso(null)
    try {
      const respuesta = await fetch('/api/matrices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validacion.problema),
      })
      if (!respuesta.ok) {
        setAviso({ tipo: 'error', texto: 'El servidor rechazó los datos o no pudo resolver el problema.' })
        return
      }
      const datos = await respuesta.json()
      if (!Array.isArray(datos?.tableM) || !Array.isArray(datos?.tableP) || typeof datos?.parentizacion !== 'string') {
        setAviso({ tipo: 'error', texto: 'Respuesta inesperada del servidor.' })
        return
      }
      setResultado(datos as Resultado)
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo conectar con el servidor. Verifique que esté activo.' })
    } finally {
      setCargando(false)
    }
  }

  const guardar = () => {
    setIntentado(true)
    if (!validacion.problema) {
      setAviso({ tipo: 'error', texto: 'Corrija los datos antes de guardar el archivo.' })
      return
    }
    const url = URL.createObjectURL(new Blob([aJson(validacion.problema)], { type: 'application/json' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'multiplicacion-matrices.json'
    enlace.click()
    URL.revokeObjectURL(url)
    setAviso({ tipo: 'ok', texto: 'Archivo guardado correctamente.' })
  }

  const cargar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    try {
      const cargado = cargarArchivo(await archivo.text())
      if (!cargado.ok) {
        setAviso({ tipo: 'error', texto: cargado.error })
        return
      }
      setFormulario(cargado.formulario)
      setResultado(null)
      setIntentado(false)
      setAviso({ tipo: 'ok', texto: `Archivo "${archivo.name}" cargado.` })
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo leer el archivo.' })
    }
  }

  return (
    <main className="pagina">
      <Link to="/" className="volver">← Menú principal</Link>
      <header className="encabezado-pagina">
        <h1><span>Multiplicación de Matrices</span></h1>
        <p className="subtitulo">Ingrese las dimensiones y encuentre la parentización de costo mínimo.</p>
      </header>

      <section className="hoja" aria-label="Datos del problema">
        <div className="acciones">
          <label className="boton boton-sec">
            Cargar archivo
            <input type="file" accept=".json,application/json" onChange={cargar} className="solo-lector" />
          </label>
          <button type="button" className="boton boton-sec" onClick={guardar}>Guardar archivo</button>
        </div>

        <form noValidate onSubmit={resolver}>
          <div className={`campo${intentado && errorCantidad ? ' con-error' : ''}`}>
            <label htmlFor="cantidad">Número de matrices ({MIN_MATRICES} a {MAX_MATRICES})</label>
            <input
              id="cantidad"
              inputMode="numeric"
              autoComplete="off"
              value={formulario.cantidad}
              onChange={(evento) => cambiarCantidad(evento.target.value)}
              aria-invalid={intentado && !!errorCantidad}
            />
            {intentado && errorCantidad && <p className="error-msg">{errorCantidad}</p>}
          </div>

          <h2>Dimensiones</h2>
          <p>La matriz Aᵢ usa dᵢ₋₁ filas y dᵢ columnas.</p>
          <div className="lista-objetos">
            {formulario.dimensiones.map((dimension, indice) => {
              const error = validacion.errores[indice]
              return (
                <div className={`campo${intentado && error ? ' con-error' : ''}`} key={indice}>
                  <label htmlFor={`dimension-${indice}`}>d{indice}</label>
                  <input
                    id={`dimension-${indice}`}
                    inputMode="numeric"
                    autoComplete="off"
                    value={dimension}
                    onChange={(evento) => cambiar({
                      ...formulario,
                      dimensiones: formulario.dimensiones.map((actual, i) => i === indice ? evento.target.value : actual),
                    })}
                    aria-invalid={intentado && !!error}
                  />
                  {intentado && error && <p className="error-msg">{error}</p>}
                </div>
              )
            })}
          </div>

          <div className="acciones">
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? 'Resolviendo…' : 'Resolver'}
            </button>
          </div>
        </form>
      </section>

      {aviso && <p className={`aviso-pagina aviso-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}

      {resultado && (
        <section className="hoja resultados" aria-label="Resultado">
          <h2>Resultado</h2>
          <p className="optimo">Costo mínimo: <strong>{resultado.costo}</strong></p>
          <p className="parentizacion">{resultado.parentizacion}</p>
          <h3>Tabla M</h3>
          <TablaMatrices nombre="M" tabla={resultado.tableM} />
          <h3>Tabla P</h3>
          <TablaMatrices nombre="P" tabla={resultado.tableP} />
        </section>
      )}
    </main>
  )
}
