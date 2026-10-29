// Tipos y validacion del problema de la mochila.
// Todo lo que no sea la pantalla vive aqui, para poder probarlo sin React.

export type Variante = '0-1' | 'acotada' | 'no-acotada'

export const VARIANTES: { valor: Variante; etiqueta: string }[] = [
  { valor: '0-1', etiqueta: 'Mochila 0/1' },
  { valor: 'acotada', etiqueta: 'Mochila acotada' },
  { valor: 'no-acotada', etiqueta: 'Mochila no acotada' },
]

export const MAX_CAPACIDAD = 20
export const MAX_OBJETOS = 10
export const MAX_VALOR = 1_000_000_000 // evita desbordes en el backend

// Lo que el usuario escribe: todo como texto, asi se puede validar "vacio" y "no es numero"
export interface ObjetoForm {
  nombre: string
  peso: string
  valor: string
  cantidad: string
}
export interface ProblemaForm {
  variante: Variante
  capacidad: string
  objetos: ObjetoForm[]
}

// Datos ya validados: lo que viaja al backend y lo que se guarda en el .json
export interface Objeto {
  nombre: string
  peso: number
  valor: number
  cantidad?: number
}
export interface Problema {
  algoritmo: 'mochila'
  variante: Variante
  capacidad: number
  objetos: Objeto[]
}

// Respuesta de POST /api/mochila
export interface Resultado {
  valor_optimo: number
  tabla: number[][]
  elegido: number[][]
  seleccion: { nombre: string; peso: number; valor: number; cantidad: number }[]
}

export interface ErroresObjeto {
  nombre?: string
  peso?: string
  valor?: string
  cantidad?: string
}
export interface Errores {
  capacidad?: string
  general?: string
  objetos: ErroresObjeto[]
}

export const objetoVacio = (): ObjetoForm => ({ nombre: '', peso: '', valor: '', cantidad: '' })
export const formularioVacio = (): ProblemaForm => ({
  variante: '0-1',
  capacidad: '',
  objetos: [objetoVacio()],
})

// ---------- Validacion campo por campo (devuelven el mensaje o undefined) ----------

const ENTERO = /^\d+$/
const DECIMAL = /^\d+([.,]\d+)?$/ // acepta 2.5 y 2,5

export function validarCapacidad(t: string): string | undefined {
  const s = t.trim()
  if (s === '') return 'La capacidad es obligatoria.'
  if (!ENTERO.test(s)) return 'La capacidad debe ser un número entero.'
  const n = Number(s)
  if (n < 1 || n > MAX_CAPACIDAD) return `La capacidad debe estar entre 1 y ${MAX_CAPACIDAD}.`
}

export function validarNombre(t: string): string | undefined {
  const s = t.trim()
  if (s === '') return 'El nombre es obligatorio.'
  if (s.length > 40) return 'El nombre no puede pasar de 40 caracteres.'
}

export function validarEnteroPositivo(t: string, campo: string): string | undefined {
  const s = t.trim()
  if (s === '') return `${campo} es obligatorio.`
  if (!ENTERO.test(s)) return `${campo} debe ser un número entero.`
  const n = Number(s)
  if (!Number.isSafeInteger(n) || n < 1) return `${campo} debe ser un entero positivo.`
}

export function validarValor(t: string): string | undefined {
  const s = t.trim()
  if (s === '') return 'El valor es obligatorio.'
  if (!DECIMAL.test(s)) return 'El valor debe ser un número positivo.'
  const n = Number(s.replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return 'El valor debe ser mayor que cero.'
  if (n > MAX_VALOR) return 'El valor no puede pasar de 1 000 000 000.'
}

export function validarObjeto(o: ObjetoForm, variante: Variante): ErroresObjeto {
  const e: ErroresObjeto = {}
  const nombre = validarNombre(o.nombre)
  const peso = validarEnteroPositivo(o.peso, 'El peso')
  const valor = validarValor(o.valor)
  if (nombre) e.nombre = nombre
  if (peso) e.peso = peso
  if (valor) e.valor = valor
  // La cantidad solo importa en la variante acotada
  if (variante === 'acotada') {
    const cantidad = validarEnteroPositivo(o.cantidad, 'La cantidad')
    if (cantidad) e.cantidad = cantidad
  }
  return e
}

// ---------- Validacion del formulario completo ----------

export function validarFormulario(f: ProblemaForm): { errores: Errores; problema: Problema | null } {
  const errores: Errores = { objetos: f.objetos.map((o) => validarObjeto(o, f.variante)) }

  const cap = validarCapacidad(f.capacidad)
  if (cap) errores.capacidad = cap
  if (f.objetos.length < 1) errores.general = 'Debe haber al menos un objeto.'
  if (f.objetos.length > MAX_OBJETOS) errores.general = `Máximo ${MAX_OBJETOS} objetos.`

  const hayErrores =
    !!errores.capacidad || !!errores.general || errores.objetos.some((e) => Object.keys(e).length > 0)
  if (hayErrores) return { errores, problema: null }

  // Sin errores: convierto el texto a numeros
  const problema: Problema = {
    algoritmo: 'mochila',
    variante: f.variante,
    capacidad: Number(f.capacidad.trim()),
    objetos: f.objetos.map((o) => {
      const obj: Objeto = {
        nombre: o.nombre.trim(),
        peso: Number(o.peso.trim()),
        valor: Number(o.valor.trim().replace(',', '.')),
      }
      if (f.variante === 'acotada') obj.cantidad = Number(o.cantidad.trim())
      return obj
    }),
  }
  return { errores, problema }
}

// Primer mensaje de error legible (se usa al cargar archivos)
export function primerError(e: Errores): string {
  if (e.general) return e.general
  if (e.capacidad) return e.capacidad
  for (let i = 0; i < e.objetos.length; i++) {
    const msg = Object.values(e.objetos[i])[0]
    if (msg) return `Objeto ${i + 1}: ${msg}`
  }
  return 'Datos inválidos.'
}

// ---------- Archivos .json ----------

export const aJson = (p: Problema): string => JSON.stringify(p, null, 2)

export type ResultadoCarga = { ok: true; formulario: ProblemaForm } | { ok: false; error: string }

// Nunca lanza excepciones: cualquier problema vuelve como { ok: false, error }
// Nunca lanza excepciones: cualquier problema vuelve como { ok: false, error }
export function cargarArchivo(texto: string): ResultadoCarga {
  let datos: unknown
  try {
    // Algunos editores de Windows agregan un BOM invisible al inicio; lo quito
    datos = JSON.parse(texto.replace(/^\uFEFF/, ''))
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' }
  }
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    return { ok: false, error: 'El archivo debe contener un objeto JSON.' }
  }
  const d = datos as Record<string, unknown>

  if (d.algoritmo !== undefined && d.algoritmo !== 'mochila') {
    return { ok: false, error: 'El archivo no corresponde al problema de la mochila.' }
  }
  if (!VARIANTES.some((v) => v.valor === d.variante)) {
    return { ok: false, error: 'La variante debe ser "0-1", "acotada" o "no-acotada".' }
  }
  if (!Array.isArray(d.objetos)) {
    return { ok: false, error: 'Falta la lista "objetos".' }
  }
  // Corto temprano: no vale la pena procesar miles de objetos para rechazarlos
  if (d.objetos.length > MAX_OBJETOS) {
    return { ok: false, error: `Máximo ${MAX_OBJETOS} objetos.` }
  }

  // Tipos estrictos, como el formato del enunciado: numeros como numeros, nombre como texto
  if (typeof d.capacidad !== 'number') {
    return { ok: false, error: 'La capacidad falta o no es un número.' }
  }
  for (let i = 0; i < d.objetos.length; i++) {
    const o = d.objetos[i]
    if (typeof o !== 'object' || o === null || Array.isArray(o)) {
      return { ok: false, error: `Objeto ${i + 1}: debe ser un objeto con nombre, peso y valor.` }
    }
    const ob = o as Record<string, unknown>
    if (typeof ob.nombre !== 'string') {
      return { ok: false, error: `Objeto ${i + 1}: "nombre" falta o no es texto.` }
    }
    const numericos = d.variante === 'acotada' ? ['peso', 'valor', 'cantidad'] : ['peso', 'valor']
    for (const campo of numericos) {
      if (typeof ob[campo] !== 'number') {
        return { ok: false, error: `Objeto ${i + 1}: "${campo}" falta o no es un número.` }
      }
    }
  }

  // Convierto a texto lo que sea numero o string; lo demas queda vacio y la validacion lo rechaza
  const aTexto = (x: unknown) => (typeof x === 'string' || typeof x === 'number' ? String(x) : '')
  const formulario: ProblemaForm = {
    variante: d.variante as Variante,
    capacidad: aTexto(d.capacidad),
    objetos: d.objetos.map((o) => {
      const ob = (typeof o === 'object' && o !== null ? o : {}) as Record<string, unknown>
      return {
        nombre: typeof ob.nombre === 'string' ? ob.nombre : '',
        peso: aTexto(ob.peso),
        valor: aTexto(ob.valor),
        cantidad: aTexto(ob.cantidad),
      }
    }),
  }

  // Reutilizo la misma validacion del formulario
  const { errores, problema } = validarFormulario(formulario)
  if (!problema) return { ok: false, error: primerError(errores) }
  return { ok: true, formulario }
}

// Limpia el ruido de decimales (0.1 + 0.2 -> 0.3) sin convertir valores pequenos en 0
export const formatear = (n: number): string => String(Number(n.toPrecision(12)))