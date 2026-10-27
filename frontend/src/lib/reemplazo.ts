// Tipos, validación y archivos .json del Proyecto 1 (Reemplazo de Equipos).

export const ALGORITMO = 'reemplazo-equipos'
export const PLAZO_MAX = 30
export const VIDA_MAX = 10
export const DINERO_MAX = 1e12

/* ------------------------------ Tipos ------------------------------ */
export interface Periodo {
  reventa: number
  mantenimiento: number
}

/** Formato del archivo .json (y del cuerpo enviado al backend). */
export interface DatosReemplazo {
  algoritmo: typeof ALGORITMO
  costoInicial: number
  plazo: number
  vidaUtil: number
  periodos: Periodo[]
}

/** Lo que el usuario escribe en el formulario (todo como texto). */
export interface FormularioReemplazo {
  costoInicial: string
  plazo: string
  vidaUtil: string
  periodos: { reventa: string; mantenimiento: string }[]
}

export interface ErroresFormulario {
  costoInicial?: string
  plazo?: string
  vidaUtil?: string
  periodos: { reventa?: string; mantenimiento?: string }[]
}

export interface Alternativa {
  reemplazoEn: number
  costoTramo: number
  total: number
  optima: boolean
}
export interface FilaTabla {
  t: number
  g: number
  siguientes: number[]
  alternativas: Alternativa[]
}
export interface Tramo {
  desde: number
  hasta: number
  anios: number
  compra: number
  mantenimiento: number
  reventa: number
  costo: number
}
export interface Plan {
  reemplazos: number[]
  costo: number
  tramos: Tramo[]
}
export interface Resultado {
  algoritmo: string
  plazo: number
  costoMinimo: number
  tabla: FilaTabla[]
  cantidadPlanes: number
  planesTruncados: boolean
  planes: Plan[]
}

export const EJEMPLO_ENUNCIADO: DatosReemplazo = {
  algoritmo: ALGORITMO,
  costoInicial: 500,
  plazo: 5,
  vidaUtil: 3,
  periodos: [
    { reventa: 400, mantenimiento: 30 },
    { reventa: 300, mantenimiento: 40 },
    { reventa: 250, mantenimiento: 60 },
  ],
}

/* --------------------------- Formato de números --------------------------- */
const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 2 })
export const formatear = (n: number): string => formato.format(n)

/* ------------------------ Validación del formulario ------------------------ */
function numeroDeTexto(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  return /^-?\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : null
}

export function validarDinero(texto: string): string | undefined {
  if (texto.trim() === '') return 'Campo obligatorio'
  const n = numeroDeTexto(texto)
  if (n === null) return 'Debe ser un número (solo dígitos y punto decimal)'
  if (n < 0) return 'No puede ser negativo'
  if (n > DINERO_MAX) return 'El valor es demasiado grande'
  return undefined
}

export function validarEntero(texto: string, min: number, max: number): string | undefined {
  if (texto.trim() === '') return 'Campo obligatorio'
  const limpio = texto.trim()
  if (!/^\d+$/.test(limpio) || Number(limpio) < min || Number(limpio) > max) {
    return `Debe ser un número entero entre ${min} y ${max}`
  }
  return undefined
}

export function validarFormulario(f: FormularioReemplazo): {
  errores: ErroresFormulario
  valido: boolean
} {
  const errores: ErroresFormulario = {
    costoInicial: validarDinero(f.costoInicial),
    plazo: validarEntero(f.plazo, 1, PLAZO_MAX),
    vidaUtil: validarEntero(f.vidaUtil, 1, VIDA_MAX),
    periodos: f.periodos.map((p) => ({
      reventa: validarDinero(p.reventa),
      mantenimiento: validarDinero(p.mantenimiento),
    })),
  }
  const valido =
    !errores.costoInicial &&
    !errores.plazo &&
    !errores.vidaUtil &&
    errores.periodos.length === Number(f.vidaUtil) &&
    errores.periodos.every((e) => !e.reventa && !e.mantenimiento)
  return { errores, valido }
}

/** Convierte el formulario en datos numéricos; null si hay algún error. */
export function aDatos(f: FormularioReemplazo): DatosReemplazo | null {
  if (!validarFormulario(f).valido) return null
  return {
    algoritmo: ALGORITMO,
    costoInicial: numeroDeTexto(f.costoInicial) as number,
    plazo: Number(f.plazo),
    vidaUtil: Number(f.vidaUtil),
    periodos: f.periodos.map((p) => ({
      reventa: numeroDeTexto(p.reventa) as number,
      mantenimiento: numeroDeTexto(p.mantenimiento) as number,
    })),
  }
}

export function aFormulario(d: DatosReemplazo): FormularioReemplazo {
  return {
    costoInicial: String(d.costoInicial),
    plazo: String(d.plazo),
    vidaUtil: String(d.vidaUtil),
    periodos: d.periodos.map((p) => ({
      reventa: String(p.reventa),
      mantenimiento: String(p.mantenimiento),
    })),
  }
}

/* ----------------------------- Archivos .json ----------------------------- */
export function aJSON(d: DatosReemplazo): string {
  return JSON.stringify(
    {
      algoritmo: ALGORITMO,
      costoInicial: d.costoInicial,
      plazo: d.plazo,
      vidaUtil: d.vidaUtil,
      periodos: d.periodos.map((p) => ({ reventa: p.reventa, mantenimiento: p.mantenimiento })),
    },
    null,
    2,
  )
}

export type LecturaArchivo =
  | { ok: true; datos: DatosReemplazo }
  | { ok: false; errores: string[] }

const esNumero = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const esObjeto = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

function revisarDinero(valor: unknown, nombre: string, errores: string[]): void {
  if (!esNumero(valor)) errores.push(`${nombre} debe ser un número.`)
  else if (valor < 0) errores.push(`${nombre} no puede ser negativo.`)
  else if (valor > DINERO_MAX) errores.push(`${nombre} es demasiado grande.`)
}

function revisarEntero(valor: unknown, nombre: string, min: number, max: number, errores: string[]): void {
  if (!esNumero(valor) || !Number.isInteger(valor) || valor < min || valor > max) {
    errores.push(`${nombre} debe ser un número entero entre ${min} y ${max}.`)
  }
}

/** Valida el contenido de un archivo .json. Nunca lanza errores. */
export function leerArchivo(texto: string): LecturaArchivo {
  const limpio = texto.replace(/^\uFEFF/, '').trim() // el Bloc de notas agrega BOM
  if (limpio === '') return { ok: false, errores: ['El archivo está vacío.'] }

  let datos: unknown
  try {
    datos = JSON.parse(limpio)
  } catch {
    return { ok: false, errores: ['El archivo no contiene un JSON válido.'] }
  }
  if (!esObjeto(datos)) {
    return { ok: false, errores: ['El archivo debe contener un objeto JSON con los datos del problema.'] }
  }

  const errores: string[] = []
  if (datos.algoritmo !== ALGORITMO) {
    errores.push(`El campo "algoritmo" debe ser "${ALGORITMO}".`)
  }
  revisarDinero(datos.costoInicial, 'El campo "costoInicial"', errores)
  revisarEntero(datos.plazo, 'El campo "plazo"', 1, PLAZO_MAX, errores)
  revisarEntero(datos.vidaUtil, 'El campo "vidaUtil"', 1, VIDA_MAX, errores)

  if (!Array.isArray(datos.periodos)) {
    errores.push('El campo "periodos" debe ser una lista.')
  } else {
    if (esNumero(datos.vidaUtil) && datos.periodos.length !== datos.vidaUtil) {
      errores.push(
        `El campo "periodos" debe tener exactamente ${datos.vidaUtil} elementos (uno por año de vida útil), pero tiene ${datos.periodos.length}.`,
      )
    }
    datos.periodos.forEach((p: unknown, i: number) => {
      if (!esObjeto(p)) {
        errores.push(`periodos[${i + 1}] debe ser un objeto con "reventa" y "mantenimiento".`)
        return
      }
      revisarDinero(p.reventa, `periodos[${i + 1}].reventa`, errores)
      revisarDinero(p.mantenimiento, `periodos[${i + 1}].mantenimiento`, errores)
    })
  }

  if (errores.length > 0) {
    const mostrados = errores.slice(0, 6)
    if (errores.length > mostrados.length) mostrados.push(`…y ${errores.length - mostrados.length} problemas más.`)
    return { ok: false, errores: mostrados }
  }

  return {
    ok: true,
    datos: {
      algoritmo: ALGORITMO,
      costoInicial: datos.costoInicial as number,
      plazo: datos.plazo as number,
      vidaUtil: datos.vidaUtil as number,
      periodos: (datos.periodos as Record<string, number>[]).map((p) => ({
        reventa: p.reventa,
        mantenimiento: p.mantenimiento,
      })),
    },
  }
}

/** Lee un archivo del usuario como texto (UTF-8). */
export function leerTexto(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result ?? ''))
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.readAsText(archivo)
  })
}
