import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ArbolABB from '../components/ArbolABB'
import TablaABB from '../components/TablaABB'
import {
  MAX_LLAVES,
  MIN_LLAVES,
  aJson,
  agregarLlave,
  cargarArchivo,
  celdasDelArbol,
  formularioInicial,
  quitarLlave,
  validarFormulario,
  type Problema,
  type ProblemaForm,
  type ResultadoABB,
} from '../lib/abb'
import { resolverABB } from '../lib/api'

interface Aviso {
  tipo: 'error' | 'ok'
  texto: string
  detalles?: string[]
}

interface Solucion {
  datos: ResultadoABB
  enviado: Problema
}

const TIEMPO_LIMITE_MS = 15000

export default function ABB() {
  const [formulario, setFormulario] = useState<ProblemaForm>(formularioInicial)
  const [intentado, setIntentado] = useState(false)
  const [solucion, setSolucion] = useState<Solucion | null>(null)
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const validacion = validarFormulario(formulario)
  const camino = useMemo(
    () => (solucion ? celdasDelArbol(solucion.datos.tableR) : new Set<string>()),
    [solucion],
  )

  const cambiar = (nuevo: ProblemaForm) => {
    setFormulario(nuevo)
    setSolucion(null)
    setAviso(null)
  }

  const cambiarCampo = (indice: number, campo: 'llave' | 'peso', valor: string) => {
    cambiar({
      llaves: formulario.llaves.map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)),
    })
  }

  const resolver = async (evento: FormEvent) => {
    evento.preventDefault()
    setIntentado(true)
    const problema = validacion.problema
    if (!problema) {
      setAviso({ tipo: 'error', texto: 'Hay datos inválidos. Revise las llaves y los pesos.' })
      return
    }
    setCargando(true)
    setAviso(null)
    const respuesta = await resolverABB(problema, AbortSignal.timeout(TIEMPO_LIMITE_MS))
    setCargando(false)

    if (!respuesta.ok) {
      const [primero, ...resto] = respuesta.errores
      setAviso(
        resto.length === 0
          ? { tipo: 'error', texto: primero }
          : { tipo: 'error', texto: 'El servidor rechazó los datos:', detalles: respuesta.errores },
      )
      return
    }
    setSolucion({ datos: respuesta.datos, enviado: problema })
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
    enlace.download = 'abb-optimo.json'
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
      setSolucion(null)
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
        <h1><span>Árboles Binarios de Búsqueda Óptimos</span></h1>
        <p className="subtitulo">Ingrese las llaves y sus pesos para construir el árbol de costo esperado mínimo.</p>
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
          <h2>Llaves</h2>
          <p>
            El peso indica qué tan seguido se busca cada llave. Entre {MIN_LLAVES} y {MAX_LLAVES} llaves;
            se ordenan alfabéticamente al resolver.
          </p>

          <ul className="lista-objetos">
            {formulario.llaves.map((fila, indice) => {
              const error = intentado ? validacion.errores[indice] : undefined
              return (
                <li className="objeto objeto-abb" key={indice}>
                  <div className={`campo${error?.llave ? ' con-error' : ''}`}>
                    <label htmlFor={`llave-${indice}`}>Llave {indice + 1}</label>
                    <input
                      id={`llave-${indice}`}
                      autoComplete="off"
                      value={fila.llave}
                      onChange={(evento) => cambiarCampo(indice, 'llave', evento.target.value)}
                      aria-invalid={!!error?.llave}
                    />
                    {error?.llave && <p className="error-msg">{error.llave}</p>}
                  </div>

                  <div className={`campo${error?.peso ? ' con-error' : ''}`}>
                    <label htmlFor={`peso-${indice}`}>Peso</label>
                    <input
                      id={`peso-${indice}`}
                      inputMode="numeric"
                      autoComplete="off"
                      value={fila.peso}
                      onChange={(evento) => cambiarCampo(indice, 'peso', evento.target.value)}
                      aria-invalid={!!error?.peso}
                    />
                    {error?.peso && <p className="error-msg">{error.peso}</p>}
                  </div>

                  <button
                    type="button"
                    className="boton boton-sec quitar"
                    onClick={() => cambiar(quitarLlave(formulario, indice))}
                    disabled={formulario.llaves.length <= MIN_LLAVES}
                    aria-label={`Quitar llave ${indice + 1}`}
                  >
                    Quitar
                  </button>
                </li>
              )
            })}
          </ul>

          {intentado && validacion.general && <p className="error-msg">{validacion.general}</p>}

          <div className="acciones">
            <button
              type="button"
              className="boton boton-sec"
              onClick={() => cambiar(agregarLlave(formulario))}
              disabled={formulario.llaves.length >= MAX_LLAVES}
            >
              Agregar llave
            </button>
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? 'Resolviendo…' : 'Resolver'}
            </button>
          </div>
        </form>
      </section>

      {aviso && (
        <div className={`aviso-pagina aviso-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
          {aviso.texto}
          {aviso.detalles && (
            <ul className="aviso-detalles">
              {aviso.detalles.map((detalle) => <li key={detalle}>{detalle}</li>)}
            </ul>
          )}
        </div>
      )}

      {solucion && <Resultado solucion={solucion} camino={camino} />}
    </main>
  )
}

function Resultado({ solucion, camino }: { solucion: Solucion; camino: Set<string> }) {
  const { datos, enviado } = solucion
  const n = datos.keys.length
  const costo = datos.tableP[1]?.[n]
  const raiz = datos.tableR[1]?.[n]
  const pesos = new Map(enviado.llaves.map((l) => [l.llave, l.peso]))

  return (
    <section className="hoja resultados" aria-label="Resultado">
      <h2>Resultado</h2>
      {typeof costo === 'number' && (
        <p className="optimo">Costo esperado mínimo: <strong>{costo.toFixed(4)}</strong></p>
      )}
      {typeof raiz === 'number' && (
        <p>Raíz óptima: <strong>K{raiz} · {datos.keys[raiz - 1]}</strong></p>
      )}

      <h3>Llaves ordenadas</h3>
      <div className="tabla-scroll">
        <table className="tabla-mochila">
          <caption>Las llaves se ordenan alfabéticamente; Kᵢ es la posición de cada llave.</caption>
          <thead>
            <tr>
              <th scope="col">K</th>
              <th scope="col">Llave</th>
              <th scope="col">Peso</th>
              <th scope="col">Probabilidad</th>
            </tr>
          </thead>
          <tbody>
            {datos.keys.map((llave, i) => (
              <tr key={llave}>
                <th scope="row">K{i + 1}</th>
                <td>{llave}</td>
                <td>{pesos.get(llave) ?? '-'}</td>
                <td>{datos.probabilities[i].toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Árbol</h3>
      <ArbolABB arbol={datos.tree} />

      <p>
        En las tablas, las celdas resaltadas son los subárboles que forman el árbol; la más intensa,
        en la fila 1 y la columna {n}, es la respuesta.
      </p>

      <h3>Tabla P</h3>
      <TablaABB nombre="P" tabla={datos.tableP} camino={camino} />

      <h3>Tabla R</h3>
      <TablaABB nombre="R" tabla={datos.tableR} camino={camino} />
    </section>
  )
}