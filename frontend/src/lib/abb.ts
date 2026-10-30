export const ALGORITMO = 'abb-optimo' as const
export const MIN_LLAVES = 1
export const MAX_LLAVES = 10

export interface LlaveEntrada {
  llave: string
  peso: number
}

export interface NodoArbol {
  value: string
  left: NodoArbol | null
  right: NodoArbol | null
}

export interface ResultadoABB {
  keys: string[]
  probabilities: number[]
  tableP: (number | null)[][]
  tableR: (number | null)[][]
  tree: NodoArbol | null
}

export interface NodoUbicado {
  nombre: string
  indice: number
  profundidad: number
  x: number
  y: number
}

export interface Arista {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ArbolUbicado {
  nodos: NodoUbicado[]
  aristas: Arista[]
  ancho: number
  alto: number
}


const SEPARACION_X = 110
const SEPARACION_Y = 90
const MARGEN = 50

// Recorrido in-order: en un ABB visita las llaves ordenadas, así que la
// columna de cada nodo es su posición en keys y su índice es columna + 1.
export function ubicarArbol(raiz: NodoArbol | null): ArbolUbicado {
  const nodos: NodoUbicado[] = []
  const aristas: Arista[] = []
  let columna = 0

  function visitar(nodo: NodoArbol | null, profundidad: number): NodoUbicado | null {
    if (!nodo) return null

    const izquierdo = visitar(nodo.left, profundidad + 1)

    const actual: NodoUbicado = {
      nombre: nodo.value,
      indice: columna + 1,
      profundidad,
      x: MARGEN + columna * SEPARACION_X,
      y: MARGEN + profundidad * SEPARACION_Y,
    }
    columna++
    nodos.push(actual)

    const derecho = visitar(nodo.right, profundidad + 1)

    for (const hijo of [izquierdo, derecho]) {
      if (hijo) aristas.push({ x1: actual.x, y1: actual.y, x2: hijo.x, y2: hijo.y })
    }
    return actual
  }

  visitar(raiz, 0)

  if (nodos.length === 0) return { nodos, aristas, ancho: 0, alto: 0 }

  return {
    nodos,
    aristas,
    ancho: Math.max(...nodos.map((n) => n.x)) + MARGEN,
    alto: Math.max(...nodos.map((n) => n.y)) + MARGEN,
  }
}

function esMatriz(x: unknown): x is (number | null)[][] {
  return (
    Array.isArray(x) &&
    x.every((fila) => Array.isArray(fila) && fila.every((v) => v === null || typeof v === 'number'))
  )
}

function esNodo(x: unknown): x is NodoArbol {
  if (typeof x !== 'object' || x === null) return false
  const n = x as Record<string, unknown>
  return (
    typeof n.value === 'string' &&
    (n.left === null || esNodo(n.left)) &&
    (n.right === null || esNodo(n.right))
  )
}

export function esResultadoABB(x: unknown): x is ResultadoABB {
  if (typeof x !== 'object' || x === null) return false
  const r = x as Record<string, unknown>
  return (
    Array.isArray(r.keys) && r.keys.every((k) => typeof k === 'string') &&
    Array.isArray(r.probabilities) && r.probabilities.every((p) => typeof p === 'number') &&
    esMatriz(r.tableP) &&
    esMatriz(r.tableR) &&
    (r.tree === null || esNodo(r.tree))
  )
}

export interface Problema {
  algoritmo: typeof ALGORITMO
  llaves: LlaveEntrada[]
}

export interface LlaveForm {
  llave: string
  peso: string
}

export interface ProblemaForm {
  llaves: LlaveForm[]
}

export interface ErroresLlave {
  llave?: string
  peso?: string
}

const llaveVacia = (): LlaveForm => ({ llave: '', peso: '' })

export const formularioInicial = (): ProblemaForm => ({
  llaves: [llaveVacia(), llaveVacia()],
})

export function agregarLlave(formulario: ProblemaForm): ProblemaForm {
  if (formulario.llaves.length >= MAX_LLAVES) return formulario
  return { llaves: [...formulario.llaves, llaveVacia()] }
}

export function quitarLlave(formulario: ProblemaForm, indice: number): ProblemaForm {
  if (formulario.llaves.length <= MIN_LLAVES) return formulario
  return { llaves: formulario.llaves.filter((_, i) => i !== indice) }
}

export function validarNombre(valor: string, indice: number): string | undefined {
  if (valor.trim() === '') return `La llave ${indice + 1} es obligatoria.`
}

// El backend usa strict=True: solo acepta enteros, no "2023" ni 20.5
export function validarPeso(valor: string, indice: number): string | undefined {
  const texto = valor.trim()
  if (texto === '') return `El peso de la llave ${indice + 1} es obligatorio.`
  if (!/^\d+$/.test(texto) || !Number.isSafeInteger(Number(texto)) || Number(texto) < 1) {
    return `El peso de la llave ${indice + 1} debe ser un entero positivo.`
  }
}

export function validarFormulario(formulario: ProblemaForm): {
  general?: string
  errores: ErroresLlave[]
  problema: Problema | null
} {
  const errores: ErroresLlave[] = formulario.llaves.map((fila, i) => ({
    llave: validarNombre(fila.llave, i),
    peso: validarPeso(fila.peso, i),
  }))

  // Llaves repetidas: misma regla que el backend (se quitan espacios, distingue mayúsculas)
  const vistos = new Set<string>()
  formulario.llaves.forEach((fila, i) => {
    const nombre = fila.llave.trim()
    if (nombre === '') return
    if (vistos.has(nombre)) errores[i].llave ??= `La llave "${nombre}" está repetida.`
    vistos.add(nombre)
  })

  const cantidad = formulario.llaves.length
  const general =
    cantidad < MIN_LLAVES || cantidad > MAX_LLAVES
      ? `Debe haber entre ${MIN_LLAVES} y ${MAX_LLAVES} llaves.`
      : undefined

  const hayErrores = general !== undefined || errores.some((e) => e.llave || e.peso)
  if (hayErrores) return { general, errores, problema: null }

  return {
    errores,
    problema: {
      algoritmo: ALGORITMO,
      llaves: formulario.llaves.map((fila) => ({
        llave: fila.llave.trim(),
        peso: Number(fila.peso.trim()),
      })),
    },
  }
}

export const aJson = (problema: Problema): string => JSON.stringify(problema, null, 2)

export type ResultadoCarga = { ok: true; formulario: ProblemaForm } | { ok: false; error: string }

export function cargarArchivo(texto: string): ResultadoCarga {
  let datos: unknown
  try {
    datos = JSON.parse(texto)
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' }
  }
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    return { ok: false, error: 'El archivo debe contener un objeto JSON.' }
  }
  const objeto = datos as Record<string, unknown>
  if (objeto.algoritmo !== ALGORITMO) {
    return { ok: false, error: `El campo "algoritmo" debe ser "${ALGORITMO}".` }
  }
  const llaves = objeto.llaves
  if (
    !Array.isArray(llaves) ||
    !llaves.every(
      (l) => typeof l === 'object' && l !== null &&
        typeof (l as Record<string, unknown>).llave === 'string' &&
        typeof (l as Record<string, unknown>).peso === 'number',
    )
  ) {
    return { ok: false, error: 'El campo "llaves" debe ser una lista de objetos { llave, peso }.' }
  }

  const formulario: ProblemaForm = {
    llaves: (llaves as LlaveEntrada[]).map((l) => ({ llave: l.llave, peso: String(l.peso) })),
  }
  const validacion = validarFormulario(formulario)
  if (!validacion.problema) {
    const primero = validacion.general ?? validacion.errores.flatMap((e) => [e.llave, e.peso]).find(Boolean)
    return { ok: false, error: primero ?? 'Datos inválidos.' }
  }
  return { ok: true, formulario }
}

// Recorre R igual que getNode en el backend: R[i][j] = k, luego (i, k-1) y (k+1, j).
// Devuelve las celdas "i,j" que definen el árbol (una por nodo).
export function celdasDelArbol(tableR: (number | null)[][]): Set<string> {
  const celdas = new Set<string>()
  const n = tableR.length - 2 // la tabla tiene n + 2 filas

  function marcar(i: number, j: number) {
    if (i > j) return
    const k = tableR[i]?.[j]
    if (typeof k !== 'number') return
    celdas.add(`${i},${j}`)
    marcar(i, k - 1)
    marcar(k + 1, j)
  }

  if (n >= 1) marcar(1, n)
  return celdas
}