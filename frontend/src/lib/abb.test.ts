import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  agregarLlave,
  cargarArchivo,
  esResultadoABB,
  formularioInicial,
  MAX_LLAVES,
  quitarLlave,
  ubicarArbol,
  validarFormulario,
  celdasDelArbol,
  type NodoArbol,
} from './abb'
import { resolverABB } from './api'

const hoja = (value: string): NodoArbol => ({ value, left: null, right: null })

const respuestaValida = {
  keys: ['A', 'B'],
  probabilities: [0.4, 0.6],
  tableP: [[null, null, null], [0, 0.4, 1.4], [null, 0, 0.6], [null, null, 0]],
  tableR: [[null, null, null], [null, 1, 2], [null, null, 2], [null, null, null]],
  tree: { value: 'B', left: hoja('A'), right: null },
}

describe('ubicarArbol', () => {
  it('ubica New York como raíz y numera in-order', () => {
    const arbol: NodoArbol = {
      value: 'New York',
      left: hoja('Atenas'),
      right: { value: 'Praga', left: hoja('París'), right: hoja('San José') },
    }
    const { nodos, aristas } = ubicarArbol(arbol)

    expect(nodos.map((n) => [n.nombre, n.indice])).toEqual([
      ['Atenas', 1], ['New York', 2], ['París', 3], ['Praga', 4], ['San José', 5],
    ])
    expect(nodos.find((n) => n.nombre === 'New York')!.profundidad).toBe(0)
    expect(aristas).toHaveLength(4) // n - 1 aristas
  })

  it('devuelve vacío si no hay árbol', () => {
    expect(ubicarArbol(null).nodos).toEqual([])
  })
})

describe('esResultadoABB', () => {
  it('acepta una respuesta válida', () => {
    expect(esResultadoABB(respuestaValida)).toBe(true)
  })

  it('rechaza un árbol mal formado', () => {
    expect(esResultadoABB({ ...respuestaValida, tree: { value: 5 } })).toBe(false)
  })
})

describe('resolverABB', () => {
  const problema = { algoritmo: 'abb-optimo' as const, llaves: [{ llave: 'A', peso: 1 }] }

  afterEach(() => vi.unstubAllGlobals())

  it('devuelve los datos si la respuesta es válida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(respuestaValida), { status: 200 }),
    ))
    expect(await resolverABB(problema)).toEqual({ ok: true, datos: respuestaValida })
  })

  it('devuelve los errores del backend en un 422', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errores: ['llaves: Las llaves deben ser unicas'] }), { status: 422 }),
    ))
    expect(await resolverABB(problema)).toEqual({
      ok: false,
      errores: ['llaves: Las llaves deben ser unicas'],
    })
  })

  it('avisa si no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const r = await resolverABB(problema)
    expect(r.ok).toBe(false)
  })
})

describe('validarFormulario', () => {
  it('construye el problema con nombres sin espacios y pesos numéricos', () => {
    const { problema } = validarFormulario({
      llaves: [{ llave: ' Praga ', peso: '2023' }, { llave: 'Atenas', peso: '6617' }],
    })
    expect(problema).toEqual({
      algoritmo: 'abb-optimo',
      llaves: [{ llave: 'Praga', peso: 2023 }, { llave: 'Atenas', peso: 6617 }],
    })
  })

  it('rechaza pesos decimales, cero y vacíos', () => {
    const { errores, problema } = validarFormulario({
      llaves: [{ llave: 'A', peso: '20.5' }, { llave: 'B', peso: '0' }, { llave: 'C', peso: '' }],
    })
    expect(problema).toBeNull()
    expect(errores.every((e) => e.peso)).toBe(true)
  })

  it('marca la segunda llave repetida', () => {
    const { errores } = validarFormulario({
      llaves: [{ llave: 'Praga', peso: '1' }, { llave: ' Praga', peso: '2' }],
    })
    expect(errores[0].llave).toBeUndefined()
    expect(errores[1].llave).toMatch(/repetida/)
  })
})

describe('agregar y quitar llaves', () => {
  it('no pasa del máximo ni baja del mínimo', () => {
    let f = formularioInicial()
    for (let i = 0; i < 20; i++) f = agregarLlave(f)
    expect(f.llaves).toHaveLength(MAX_LLAVES)

    f = { llaves: [{ llave: 'A', peso: '1' }] }
    expect(quitarLlave(f, 0).llaves).toHaveLength(1)
  })
})

describe('cargarArchivo', () => {
  it('carga un archivo válido', () => {
    const r = cargarArchivo('{"algoritmo":"abb-optimo","llaves":[{"llave":"A","peso":3}]}')
    expect(r).toEqual({ ok: true, formulario: { llaves: [{ llave: 'A', peso: '3' }] } })
  })

  it('rechaza otro algoritmo', () => {
    const r = cargarArchivo('{"algoritmo":"mochila","llaves":[]}')
    expect(r.ok).toBe(false)
  })
})

describe('celdasDelArbol', () => {
  it('marca una celda por nodo siguiendo la tabla R', () => {
    // Tabla R del ejemplo de ciudades (n = 5)
    const tableR = [
      [null, null, null, null, null, null],
      [null, 1, 2, 2, 2, 2],
      [null, null, 2, 2, 2, 2],
      [null, null, null, 3, 3, 4],
      [null, null, null, null, 4, 5],
      [null, null, null, null, null, 5],
      [null, null, null, null, null, null],
    ]
    // raíz (1,5)=2 → izquierda (1,1); derecha (3,5)=4 → (3,3) y (5,5)
    expect(celdasDelArbol(tableR)).toEqual(new Set(['1,5', '1,1', '3,5', '3,3', '5,5']))
  })
})