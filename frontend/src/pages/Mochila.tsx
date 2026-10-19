import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TablaMochila from '../components/TablaMochila'
import {
  VARIANTES,
  MAX_CAPACIDAD,
  MAX_OBJETOS,
  aJson,
  cargarArchivo,
  formatear,
  formularioVacio,
  objetoVacio,
  validarFormulario,
  type ObjetoForm,
  type Problema,
  type ProblemaForm,
  type Resultado,
  type Variante,
} from '../lib/mochila'

interface Aviso {
  tipo: 'error' | 'ok'
  texto: string
}

export default function Mochila() {
  const [form, setForm] = useState<ProblemaForm>(formularioVacio)
  const [tocados, setTocados] = useState<Set<string>>(new Set()) // campos que el usuario ya visito
  const [intentado, setIntentado] = useState(false) // true despues del primer intento de resolver
  // Guardo el problema junto al resultado: la tabla se dibuja con lo que se envio,
  // aunque el usuario siga editando el formulario despues
  const [resultado, setResultado] = useState<{ datos: Resultado; problema: Problema } | null>(null)
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  // Se recalcula en cada render: la validacion siempre esta al dia con lo escrito
  const { errores, problema } = validarFormulario(form)

  // Cualquier edicion invalida el resultado anterior
  const editar = (nuevo: ProblemaForm) => {
    setForm(nuevo)
    setResultado(null)
    setAviso(null)
  }
  const tocar = (clave: string) => setTocados((prev) => new Set(prev).add(clave))
  // Muestro el error si ya hubo intento, si el campo fue visitado o si tiene algo escrito
  const mostrar = (clave: string, valor: string, error?: string) =>
    intentado || tocados.has(clave) || valor.trim() !== '' ? error : undefined

  const cambiarObjeto = (i: number, campo: keyof ObjetoForm, valor: string) =>
    editar({
      ...form,
      objetos: form.objetos.map((o, k) => (k === i ? { ...o, [campo]: valor } : o)),
    })

  const agregarObjeto = () => editar({ ...form, objetos: [...form.objetos, objetoVacio()] })
  const quitarObjeto = (i: number) => {
    editar({ ...form, objetos: form.objetos.filter((_, k) => k !== i) })
    setTocados(new Set()) // los indices cambian al quitar una fila
  }

  const resolver = async (e: FormEvent) => {
    e.preventDefault()
    setIntentado(true)
    if (!problema) {
      setAviso({ tipo: 'error', texto: 'Hay datos inválidos. Revise los campos marcados.' })
      return
    }
    setCargando(true)
    setAviso(null)
    try {
      // El algoritmo se ejecuta en el backend; aqui solo se envia y se muestra
      const r = await fetch('/api/mochila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problema),
      })
      if (!r.ok) {
        setAviso({
          tipo: 'error',
          texto:
            r.status === 422
              ? 'El servidor rechazó los datos. Revíselos e intente de nuevo.'
              : 'El servidor no pudo resolver el problema.',
        })
        return
      }
      const datos = await r.json()
      // Reviso la forma de la respuesta antes de usarla, para no romper la pantalla
      if (
        typeof datos?.valor_optimo !== 'number' ||
        !Array.isArray(datos?.tabla) ||
        !Array.isArray(datos?.elegido) ||
        !Array.isArray(datos?.seleccion)
      ) {
        setAviso({ tipo: 'error', texto: 'Respuesta inesperada del servidor.' })
        return
      }
      setResultado({ datos: datos as Resultado, problema })
    } catch {
      setAviso({
        tipo: 'error',
        texto: 'No se pudo conectar con el servidor. Verifique que el backend esté activo.',
      })
    } finally {
      setCargando(false)
    }
  }

  const guardar = () => {
    setIntentado(true)
    if (!problema) {
      setAviso({ tipo: 'error', texto: 'Corrija los datos antes de guardar el archivo.' })
      return
    }
    // Descarga de un .json creado en el navegador
    const blob = new Blob([aJson(problema)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mochila.json'
    a.click()
    URL.revokeObjectURL(url)
    setAviso({ tipo: 'ok', texto: 'Archivo guardado como mochila.json.' })
  }

  const cargar = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // permite volver a cargar el mismo archivo
    if (!archivo) return
    if (archivo.size > 1_000_000) {
      setAviso({ tipo: 'error', texto: 'El archivo es demasiado grande.' })
      return
    }
    let texto: string
    try {
      texto = await archivo.text()
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo leer el archivo.' })
      return
    }
    const r = cargarArchivo(texto) // nunca lanza: devuelve ok o un mensaje
    if (!r.ok) {
      setAviso({ tipo: 'error', texto: r.error })
      return
    }
    setForm(r.formulario)
    setResultado(null)
    setTocados(new Set())
    setIntentado(false)
    setAviso({ tipo: 'ok', texto: `Archivo "${archivo.name}" cargado. Puede editarlo y resolver.` })
  }

  const esAcotada = form.variante === 'acotada'
  const errCap = mostrar('cap', form.capacidad, errores.capacidad)

  return (
    <main className="pagina">
      <Link to="/" className="volver">← Menú principal</Link>

      <header className="encabezado-pagina">
        <h1><span>Problema de la Mochila</span></h1>
        <p className="subtitulo">Elija la variante, ingrese los datos y resuélvalo.</p>
      </header>

      <section className="hoja" aria-label="Datos del problema">
        <div className="acciones">
          {/* El input real queda oculto: el label hace de boton */}
          <label className="boton boton-sec">
            Cargar archivo
            <input type="file" accept=".json,application/json" onChange={cargar} className="solo-lector" />
          </label>
          <button type="button" className="boton boton-sec" onClick={guardar}>
            Guardar archivo
          </button>
        </div>

        <form noValidate onSubmit={resolver}>
          <fieldset className="variantes">
            <legend>Variante</legend>
            {VARIANTES.map((v) => (
              <label key={v.valor} className="opcion-variante">
                <input
                  type="radio"
                  name="variante"
                  value={v.valor}
                  checked={form.variante === v.valor}
                  onChange={() => editar({ ...form, variante: v.valor as Variante })}
                />
                {v.etiqueta}
              </label>
            ))}
          </fieldset>

          <div className={`campo${errCap ? ' con-error' : ''}`}>
            <label htmlFor="cap">Capacidad de la mochila (1 a {MAX_CAPACIDAD})</label>
            <input
              id="cap"
              inputMode="numeric"
              autoComplete="off"
              value={form.capacidad}
              onChange={(e) => editar({ ...form, capacidad: e.target.value })}
              onBlur={() => tocar('cap')}
              aria-invalid={!!errCap}
              aria-describedby={errCap ? 'err-cap' : undefined}
            />
            {errCap && <p className="error-msg" id="err-cap">{errCap}</p>}
          </div>

          <h2>Objetos ({form.objetos.length} de {MAX_OBJETOS})</h2>
          {errores.general && intentado && <p className="error-msg">{errores.general}</p>}

          <ul className="lista-objetos">
            {form.objetos.map((o, i) => {
              const e = errores.objetos[i] ?? {}
              const campos: { campo: keyof ObjetoForm; etiqueta: string; ayuda: string }[] = [
                { campo: 'nombre', etiqueta: 'Nombre', ayuda: 'Ej. Linterna' },
                { campo: 'peso', etiqueta: 'Peso', ayuda: 'Entero' },
                { campo: 'valor', etiqueta: 'Valor', ayuda: 'Ej. 10' },
                ...(esAcotada
                  ? [{ campo: 'cantidad' as const, etiqueta: 'Cantidad disponible', ayuda: 'Entero' }]
                  : []),
              ]
              return (
                <li className={`objeto${esAcotada ? ' con-cantidad' : ''}`} key={i}>
                  {campos.map(({ campo, etiqueta, ayuda }) => {
                    const clave = `o${i}.${campo}`
                    const err = mostrar(clave, o[campo], e[campo])
                    return (
                      <div className={`campo${err ? ' con-error' : ''}`} key={campo}>
                        <label htmlFor={clave}>{etiqueta}</label>
                        <input
                          id={clave}
                          placeholder={ayuda}
                          autoComplete="off"
                          value={o[campo]}
                          onChange={(ev) => cambiarObjeto(i, campo, ev.target.value)}
                          onBlur={() => tocar(clave)}
                          aria-invalid={!!err}
                          aria-describedby={err ? `err-${clave}` : undefined}
                        />
                        {err && <p className="error-msg" id={`err-${clave}`}>{err}</p>}
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    className="boton boton-sec quitar"
                    onClick={() => quitarObjeto(i)}
                    disabled={form.objetos.length <= 1}
                    aria-label={`Quitar objeto ${i + 1}`}
                  >
                    Quitar
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="acciones">
            <button
              type="button"
              className="boton boton-sec"
              onClick={agregarObjeto}
              disabled={form.objetos.length >= MAX_OBJETOS}
            >
              Agregar objeto
            </button>
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? 'Resolviendo…' : 'Resolver'}
            </button>
          </div>
        </form>
      </section>

      {aviso && (
        <p className={`aviso-pagina aviso-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
          {aviso.texto}
        </p>
      )}

      {resultado && (
        <section className="hoja resultados" aria-label="Resultado">
          <h2>Resultado</h2>
          <p className="optimo">
            Valor óptimo: <strong>{formatear(resultado.datos.valor_optimo)}</strong>
          </p>

          <h3>Objetos seleccionados</h3>
          {resultado.datos.seleccion.length === 0 ? (
            <p>Ningún objeto cabe en la mochila.</p>
          ) : (
            <ul className="seleccion">
              {resultado.datos.seleccion.map((s, k) => (
                <li key={k}>
                  <strong>{s.nombre}</strong>
                  {/* En 0/1 cada objeto va una sola vez, la cantidad no aporta */}
                  {resultado.problema.variante !== '0-1' && <> × {s.cantidad}</>}
                  <small> (peso {s.peso}, valor {formatear(s.valor)})</small>
                </li>
              ))}
            </ul>
          )}

          <h3>Tabla de programación dinámica</h3>
          <TablaMochila
            tabla={resultado.datos.tabla}
            elegido={resultado.datos.elegido}
            objetos={resultado.problema.objetos}
            capacidad={resultado.problema.capacidad}
          />
        </section>
      )}
    </main>
  )
}