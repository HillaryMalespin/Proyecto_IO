// Tipos y validacion del algoritmo de series deportivas.
// Todo lo que no sea la pantalla vive aqui, para poder probarlo sin React.

export const MAX_JUEGOS = 11

//Datos del formulario
export interface ProblemaForm {
  juegos: string
  ph: string
  pr: string
  formato: boolean[]
}

//Datos del problema a manejar como el .json
export interface Problema {
  ph: number
  pr: number
  formato: boolean[]
}

//Datos del problema a manejar como el .json
export interface ProblemaObjeto {
  algoritmo: string
  juegos: string
  ph: string
  pr: string
  formato: boolean[]
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

// ---------- Validacion campo por campo (devuelven el mensaje o undefined) ----------

const ENTERO = /^\d+$/
const DECIMAL = /^\d+([.,]\d+)?$/ // acepta 2.5 y 2,5

//todo solo enteros menores a 11 y mayores a 0
export function validarCapacidad(t: string): string | undefined {
  const s = t.trim()
  if (s === '') return 'La capacidad es obligatoria.'
  if (!ENTERO.test(s)) return 'La capacidad debe ser un número entero.'
  const n = Number(s)
  if (n < 1 || n > MAX_JUEGOS) return `La capacidad debe estar entre 1 y ${MAX_JUEGOS}.`
}

//todo solo valores entre 0 y 1 incluidos ambos bordes
export function validarProbabilidad(t: string): string | undefined {
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
}

// ---------- Validacion del formulario completo ----------

/*export function validarFormulario(f: ProblemaForm): { errores: Errores; problema: Problema | null } {
  const errores: Errores = { objetos: f.objetos.map((o) => validarObjeto(o, f.variante)) }

  const cap = validarCapacidad(f.cantidadJuegos)
  if (cap) errores.cantidadJuegos = cap
  if (f.ordenJuegos.length < 1) errores.general = 'Debe haber al menos un objeto.'
  if (f.ordenJuegos.length > MAX_OBJETOS) errores.general = `Máximo ${MAX_OBJETOS} objetos.`

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
}*/

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

export const aJson = (p: ProblemaObjeto): string => JSON.stringify(p, null, 2)

export type ResultadoCarga = { ok: true; formulario: ProblemaForm; fallback: false} | { ok: true; formulario: ProblemaForm; fallback: true; error: string } | { ok: false; error: string } 

// Nunca lanza excepciones: cualquier problema vuelve como { ok: false, error }
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
  const d = datos as Record<string, unknown>

  if (d.algoritmo !== undefined && d.algoritmo !== 'series-deportivas') {
    return { ok: false, error: 'El archivo no corresponde al problema de series deportivas.' }
  }

  if (d.ph !== undefined && !( !isNaN(Number(d.ph)) )) {//si d.juegos viene y no es un numero entero
    return { ok: false, error: 'El archivo no corresponde al problema de la mochila.' }
  }

  var problema = false

  var valorJuegos = ""
  var valorPH = ""
  var valorPR = ""
  var valorFormato = [] as boolean[]

  if (d.juegos !== undefined && !isNaN(Number(d.juegos)) && Number.isInteger(Number(d.juegos))) {//si juegos viene y no es un numero entero
    if (Number(d.juegos) > MAX_JUEGOS){
      problema=true
      valorJuegos = String(MAX_JUEGOS)
    }
    else if (Number(d.juegos) < 1){
      problema=true
      valorJuegos = "1"
    }
    else {
      valorJuegos = String(d.juegos)
    }
  }
  else {
    problema=true
  }
  
  if (d.ph !== undefined && !isNaN(Number(d.ph))) {//si ph viene y es un numero
    if (Number(d.ph) > 1){
      problema=true
      valorPH = "1"
    }
    else if (Number(d.ph) < 0){
      problema=true
      valorPH = "0"
    }
    else {
      valorPH = String(d.ph)
    }
  }
  else {
    problema=true
  }

  if (d.pr !== undefined && !isNaN(Number(d.pr))) {//si ph viene y es un numero
    if (Number(d.pr) > 1){
      problema=true
      valorPR = "1"
    }
    else if (Number(d.pr) < 0){
      problema=true
      valorPR = "0"
    }
    else {
      valorPR = String(d.pr)
    }
  }
  else {
    problema=true
  }

  if (d.formato !== undefined && Array.isArray(d.formato)){//si el formato viene y es array
    const largoJson = d.formato.length

    for (let i = 0; i < Number(valorJuegos); i++){//para cada juego
      if (largoJson-1 >= i && typeof d.formato[i] == "boolean"){//si aun quedan elementos en la lista y son boolean
        valorFormato.push(d.formato[i])// insertelo
      }
      else {//si no, rellene por defecto
        problema = true
        valorFormato.push(true)
      }
    }
  }
  else {//si no, rellene por defecto
    problema=true

    for (let i = 0; i < Number(valorJuegos); i++){//para cada juego
      problema = true
      valorFormato.push(true)
    }
  }

  const formulario: ProblemaForm = {
    //si juegos viene y es un numero entero
    juegos: valorJuegos,

    ph: valorPH,

    pr: valorPR,

    formato: valorFormato
  }

  if (problema) return { ok: true, formulario, fallback: true, error: 'Se sustituyeron por defecto los valores erróneos del archivo.' }
  return { ok: true, formulario, fallback: false}
}

export const formatear = (n: number): string => String(Math.round(n * 10000) / 10000)