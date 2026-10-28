export const ALGORITMO = 'multiplicacion-matrices' as const
export const MIN_MATRICES = 2
export const MAX_MATRICES = 10

export interface Problema {
  algoritmo: typeof ALGORITMO
  dimensiones: number[]
}

export interface ProblemaForm {
  cantidad: string
  dimensiones: string[]
}

export interface Resultado {
  algoritmo?: string
  dimensiones: number[]
  n: number
  tableM: (number | null)[][]
  tableP: (number | null)[][]
  parentizacion: string
  costo: number
}

export const formularioInicial = (): ProblemaForm => ({
  cantidad: String(MIN_MATRICES),
  dimensiones: ['', '', ''],
})

export function redimensionar(dimensiones: string[], cantidad: number): string[] {
  const largo = cantidad + 1
  return Array.from({ length: largo }, (_, i) => dimensiones[i] ?? '')
}

export function validarCantidad(cantidad: string): string | undefined {
  const texto = cantidad.trim()
  if (texto === '') return 'La cantidad de matrices es obligatoria.'
  if (!/^\d+$/.test(texto)) return 'La cantidad debe ser un número entero.'
  const numero = Number(texto)
  if (numero < MIN_MATRICES || numero > MAX_MATRICES) {
    return `La cantidad debe estar entre ${MIN_MATRICES} y ${MAX_MATRICES}.`
  }
}

export function validarDimension(valor: string, indice: number): string | undefined {
  const texto = valor.trim()
  if (texto === '') return `La dimensión d${indice} es obligatoria.`
  if (!/^\d+$/.test(texto)) return `La dimensión d${indice} debe ser un entero positivo.`
  if (!Number.isSafeInteger(Number(texto)) || Number(texto) < 1) {
    return `La dimensión d${indice} debe ser un entero positivo.`
  }
}

export function validarFormulario(formulario: ProblemaForm): {
  errores: (string | undefined)[]
  problema: Problema | null
} {
  const errorCantidad = validarCantidad(formulario.cantidad)
  const cantidad = Number(formulario.cantidad)
  const errores = formulario.dimensiones.map((valor, indice) => validarDimension(valor, indice))
  if (errorCantidad || !Number.isInteger(cantidad) || formulario.dimensiones.length !== cantidad + 1) {
    return { errores: [errorCantidad, ...errores], problema: null }
  }
  if (errores.some(Boolean)) return { errores, problema: null }

  return {
    errores,
    problema: {
      algoritmo: ALGORITMO,
      dimensiones: formulario.dimensiones.map(Number),
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
  if (!Array.isArray(objeto.dimensiones) || objeto.dimensiones.some((d) => typeof d !== 'number')) {
    return { ok: false, error: 'El campo "dimensiones" debe ser una lista de enteros positivos.' }
  }

  const dimensiones = objeto.dimensiones as number[]
  const formulario: ProblemaForm = {
    cantidad: String(dimensiones.length - 1),
    dimensiones: dimensiones.map(String),
  }
  const validacion = validarFormulario(formulario)
  if (!validacion.problema) return { ok: false, error: validacion.errores.find(Boolean) ?? 'Datos inválidos.' }
  return { ok: true, formulario }
}
