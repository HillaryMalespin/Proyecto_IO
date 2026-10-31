import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import PaginaAlgoritmo from '../components/PaginaAlgoritmo'
import Campo from '../components/Campo'
import TablaAnalisis from '../components/reemplazo/TablaAnalisis'
import VisorPlanes from '../components/reemplazo/VisorPlanes'
import { AvisoReventa, NotaGanancia } from '../components/reemplazo/Avisos'
import { resolverReemplazo } from '../lib/api'
import {
  EJEMPLO_ENUNCIADO,
  PLAZO_MAX,
  VIDA_MAX,
  aDatos,
  aFormulario,
  aJSON,
  formatear,
  leerArchivo,
  leerTexto,
  validarFormulario,
} from '../lib/reemplazo'
import type { DatosReemplazo, FormularioReemplazo, Resultado } from '../lib/reemplazo'

interface Mensaje {
  tipo: 'error' | 'info'
  titulo: string
  lineas: string[]
}

const FORMULARIO_VACIO: FormularioReemplazo = { costoInicial: '', plazo: '', vidaUtil: '', periodos: [] }
const ESPERA_MAXIMA_MS = 15000
const TAMANIO_MAXIMO_ARCHIVO = 1_000_000

export default function Reemplazo() {
  const [form, setForm] = useState<FormularioReemplazo>(FORMULARIO_VACIO)
  const [tocados, setTocados] = useState<Record<string, boolean>>({})
  const [intentado, setIntentado] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [claveResultado, setClaveResultado] = useState('')
  const [calculando, setCalculando] = useState(false)

  const refArchivo = useRef<HTMLInputElement>(null)
  const refResultado = useRef<HTMLDivElement>(null)
  const refPeticion = useRef<AbortController | null>(null)

  const { errores, valido } = useMemo(() => validarFormulario(form), [form])
  const claveActual = valido ? JSON.stringify(aDatos(form)) : ''
  const obsoleto = resultado !== null && claveActual !== claveResultado

  const ver = (id: string) => intentado || tocados[id] === true
  const marcar = (id: string) => setTocados((t) => ({ ...t, [id]: true }))

  useEffect(() => () => refPeticion.current?.abort(), [])
  useEffect(() => {
    if (resultado) refResultado.current?.scrollIntoView?.({ block: 'start' })
  }, [resultado])

  /* ------------------------------ Edición ------------------------------ */
  function cambiarCampo(campo: 'costoInicial' | 'plazo', valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
    marcar(campo)
  }

  function cambiarVidaUtil(valor: string) {
    setForm((f) => {
      const n = /^\d+$/.test(valor.trim()) ? Number(valor) : NaN
      const periodos =
        n >= 1 && n <= VIDA_MAX
          ? Array.from({ length: n }, (_, i) => f.periodos[i] ?? { reventa: '', mantenimiento: '' })
          : f.periodos
      return { ...f, vidaUtil: valor, periodos }
    })
    marcar('vidaUtil')
  }

  function cambiarPeriodo(i: number, campo: 'reventa' | 'mantenimiento', valor: string) {
    setForm((f) => ({
      ...f,
      periodos: f.periodos.map((p, k) => (k === i ? { ...p, [campo]: valor } : p)),
    }))
    marcar(`${campo}-${i}`)
  }

  function aplicarDatos(d: DatosReemplazo, titulo: string) {
    setForm(aFormulario(d))
    setTocados({})
    setIntentado(false)
    setResultado(null)
    setMensaje({ tipo: 'info', titulo, lineas: [] })
  }

  function limpiar() {
    refPeticion.current?.abort()
    setForm(FORMULARIO_VACIO)
    setTocados({})
    setIntentado(false)
    setResultado(null)
    setMensaje(null)
    setCalculando(false)
  }

  /* ------------------------------ Calcular ------------------------------ */
  async function calcular(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    const datos = aDatos(form)
    if (!datos) {
      setMensaje({
        tipo: 'error',
        titulo: 'Revise los datos ingresados.',
        lineas: ['Hay campos con errores; están marcados en el formulario.'],
      })
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    refPeticion.current?.abort()
    const control = new AbortController()
    refPeticion.current = control
    const temporizador = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS)
    setCalculando(true)
    setMensaje(null)

    const respuesta = await resolverReemplazo(datos, control.signal)
    clearTimeout(temporizador)
    if (refPeticion.current !== control) return // llegó tarde: ya hay otra petición o se limpió

    setCalculando(false)
    if (respuesta.ok) {
      setResultado(respuesta.datos)
      setClaveResultado(JSON.stringify(datos))
    } else {
      setMensaje({ tipo: 'error', titulo: 'No se pudo calcular el resultado.', lineas: respuesta.errores })
    }
  }

  /* --------------------------- Guardar y cargar --------------------------- */
  function guardar() {
    const datos = aDatos(form)
    if (!datos) {
      setIntentado(true)
      setMensaje({
        tipo: 'error',
        titulo: 'No se puede guardar todavía.',
        lineas: ['Corrija los campos marcados antes de guardar el archivo.'],
      })
      return
    }
    try {
      const url = URL.createObjectURL(new Blob([aJSON(datos)], { type: 'application/json' }))
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = 'reemplazo-equipos.json'
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      setTimeout(() => URL.revokeObjectURL(url), 0)
      setMensaje({ tipo: 'info', titulo: 'Archivo guardado: reemplazo-equipos.json', lineas: [] })
    } catch {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar el archivo.', lineas: [] })
    }
  }

  async function cargar(e: ChangeEvent<HTMLInputElement>) {
    const entrada = e.target
    const archivo = entrada.files?.[0]
    if (!archivo) return
    try {
      if (archivo.size > TAMANIO_MAXIMO_ARCHIVO) {
        setMensaje({
          tipo: 'error',
          titulo: `No se pudo cargar "${archivo.name}".`,
          lineas: ['El archivo es demasiado grande (máximo 1 MB).'],
        })
        return
      }
      const lectura = leerArchivo(await leerTexto(archivo))
      if (!lectura.ok) {
        setMensaje({ tipo: 'error', titulo: `No se pudo cargar "${archivo.name}".`, lineas: lectura.errores })
        return
      }
      aplicarDatos(lectura.datos, `Archivo cargado: ${archivo.name}`)
    } catch {
      setMensaje({ tipo: 'error', titulo: `No se pudo leer "${archivo.name}".`, lineas: [] })
    } finally {
      entrada.value = '' // permite volver a cargar el mismo archivo
    }
  }

  /* -------------------------------- Vista -------------------------------- */
  return (
    <PaginaAlgoritmo
      titulo="Reemplazo de Equipos"
      subtitulo="Descubra cuándo conviene reemplazar un equipo para gastar lo mínimo durante todo el proyecto."
    >
      <form onSubmit={calcular} noValidate aria-label="Datos del problema">
        <section className="panel">
          <h2>Datos del problema</h2>
          <div className="rejilla-campos">
            <Campo
              id="costoInicial"
              etiqueta="Costo inicial del equipo"
              ayuda="Precio de compra de un equipo nuevo."
              valor={form.costoInicial}
              error={ver('costoInicial') ? errores.costoInicial : undefined}
              onChange={(v) => cambiarCampo('costoInicial', v)}
              onBlur={() => marcar('costoInicial')}
            />
            <Campo
              id="plazo"
              etiqueta="Plazo del proyecto (años)"
              ayuda={`Entero de 1 a ${PLAZO_MAX}.`}
              modo="numeric"
              valor={form.plazo}
              error={ver('plazo') ? errores.plazo : undefined}
              onChange={(v) => cambiarCampo('plazo', v)}
              onBlur={() => marcar('plazo')}
            />
            <Campo
              id="vidaUtil"
              etiqueta="Vida útil del equipo (años)"
              ayuda={`Entero de 1 a ${VIDA_MAX}.`}
              modo="numeric"
              valor={form.vidaUtil}
              error={ver('vidaUtil') ? errores.vidaUtil : undefined}
              onChange={cambiarVidaUtil}
              onBlur={() => marcar('vidaUtil')}
            />
          </div>
        </section>

        <section className="panel">
          <h2>Reventa y mantenimiento</h2>
          {form.periodos.length === 0 ? (
            <p className="ayuda">
              Indique la vida útil del equipo para ingresar el precio de reventa y el costo de
              mantenimiento de cada año de uso.
            </p>
          ) : (
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th scope="col">Año de uso</th>
                  <th scope="col">Precio de reventa</th>
                  <th scope="col">Costo de mantenimiento</th>
                </tr>
              </thead>
              <tbody>
                {form.periodos.map((p, i) => {
                  const idR = `reventa-${i}`
                  const idM = `mantenimiento-${i}`
                  const errR = ver(idR) ? errores.periodos[i]?.reventa : undefined
                  const errM = ver(idM) ? errores.periodos[i]?.mantenimiento : undefined
                  return (
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>
                        <input
                          className="entrada"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          aria-label={`Precio de reventa, año ${i + 1}`}
                          aria-invalid={errR ? true : undefined}
                          aria-describedby={errR ? `${idR}-error` : undefined}
                          value={p.reventa}
                          onChange={(e) => cambiarPeriodo(i, 'reventa', e.target.value)}
                          onBlur={() => marcar(idR)}
                        />
                        {errR && <p className="error" id={`${idR}-error`}>{errR}</p>}
                      </td>
                      <td>
                        <input
                          className="entrada"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          aria-label={`Costo de mantenimiento, año ${i + 1}`}
                          aria-invalid={errM ? true : undefined}
                          aria-describedby={errM ? `${idM}-error` : undefined}
                          value={p.mantenimiento}
                          onChange={(e) => cambiarPeriodo(i, 'mantenimiento', e.target.value)}
                          onBlur={() => marcar(idM)}
                        />
                        {errM && <p className="error" id={`${idM}-error`}>{errM}</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Proyecto 1: aviso (no bloquea) si la reventa supera el costo inicial */}
        <AvisoReventa formulario={form} />

        {mensaje && (
          <div
            className={`mensaje ${mensaje.tipo === 'error' ? 'mensaje-error' : ''}`}
            role={mensaje.tipo === 'error' ? 'alert' : 'status'}
          >
            <p className="mensaje-titulo">{mensaje.titulo}</p>
            {mensaje.lineas.length > 0 && (
              <ul>
                {mensaje.lineas.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="acciones">
          <button type="submit" className="boton boton-principal" disabled={calculando}>
            {calculando ? 'Calculando…' : 'Calcular'}
          </button>
          <button type="button" className="boton" onClick={guardar}>Guardar archivo JSON</button>
          <button type="button" className="boton" onClick={() => refArchivo.current?.click()}>
            Cargar archivo JSON
          </button>
          <button type="button" className="boton" onClick={() => aplicarDatos(EJEMPLO_ENUNCIADO, 'Ejemplo cargado.')}>
            Cargar ejemplo
          </button>
          <button type="button" className="boton" onClick={limpiar}>Limpiar</button>
          <input
            ref={refArchivo}
            className="sr"
            type="file"
            accept=".json,application/json"
            aria-label="Archivo JSON con los datos del problema"
            tabIndex={-1}
            onChange={cargar}
          />
        </div>
      </form>

      {resultado && (
        <div className="resultado" ref={refResultado}>
          {obsoleto && (
            <p className="mensaje" role="status">
              Los datos cambiaron después del último cálculo. Presione «Calcular» para actualizar el resultado.
            </p>
          )}
          <section className="panel" aria-labelledby="titulo-resultado">
            <h2 id="titulo-resultado">Resultado</h2>
            <p className="costo-minimo">
              Costo mínimo total: <strong>{formatear(resultado.costoMinimo)}</strong>
            </p>
            {/* Proyecto 1: explica un costo mínimo negativo (ganancia neta) */}
            <NotaGanancia costoMinimo={resultado.costoMinimo} />
          </section>
          <TablaAnalisis resultado={resultado} />
          <VisorPlanes key={claveResultado} resultado={resultado} />
        </div>
      )}
    </PaginaAlgoritmo>
  )
}