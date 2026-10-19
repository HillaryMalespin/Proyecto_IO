import { describe, it, expect } from 'vitest'
import { cargarArchivo, validarFormulario, type ProblemaForm } from './mochila'

const valido = (): ProblemaForm => ({
  variante: '0-1',
  capacidad: '10',
  objetos: [{ nombre: 'A', peso: '5', valor: '10', cantidad: '' }],
})

describe('validación del formulario', () => {
  it('acepta datos correctos y los convierte a números', () => {
    const { problema } = validarFormulario(valido())
    expect(problema).toEqual({
      algoritmo: 'mochila',
      variante: '0-1',
      capacidad: 10,
      objetos: [{ nombre: 'A', peso: 5, valor: 10 }],
    })
  })

  it('acepta coma decimal en el valor', () => {
    const f = valido()
    f.objetos[0].valor = '2,5'
    expect(validarFormulario(f).problema?.objetos[0].valor).toBe(2.5)
  })

  it('rechaza capacidad fuera de rango, vacía o no entera', () => {
    for (const cap of ['0', '21', '', 'abc', '3.5']) {
      const f = valido()
      f.capacidad = cap
      const { errores, problema } = validarFormulario(f)
      expect(problema).toBeNull()
      expect(errores.capacidad).toBeTruthy()
    }
  })

  it('rechaza campos vacíos o inválidos de un objeto', () => {
    const f = valido()
    f.objetos[0] = { nombre: '', peso: '0', valor: '-1', cantidad: '' }
    const { errores } = validarFormulario(f)
    expect(errores.objetos[0].nombre).toBeTruthy()
    expect(errores.objetos[0].peso).toBeTruthy()
    expect(errores.objetos[0].valor).toBeTruthy()
  })

  it('exige cantidad solo en la variante acotada', () => {
    const f = valido()
    expect(validarFormulario(f).problema).not.toBeNull()
    f.variante = 'acotada'
    expect(validarFormulario(f).errores.objetos[0].cantidad).toBeTruthy()
    f.objetos[0].cantidad = '3'
    expect(validarFormulario(f).problema?.objetos[0].cantidad).toBe(3)
  })

  it('limita el número de objetos a 10', () => {
    const f = valido()
    f.objetos = Array.from({ length: 11 }, () => ({ ...f.objetos[0] }))
    expect(validarFormulario(f).errores.general).toBeTruthy()
  })
})

describe('carga de archivos', () => {
  it('carga un archivo con el formato del enunciado', () => {
    const texto = JSON.stringify({
      algoritmo: 'mochila',
      variante: 'acotada',
      capacidad: 15,
      objetos: [{ nombre: 'Linterna', peso: 2, valor: 10, cantidad: 3 }],
    })
    const r = cargarArchivo(texto)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.formulario.variante).toBe('acotada')
      expect(r.formulario.objetos[0].cantidad).toBe('3')
    }
  })

  it('devuelve un mensaje (no lanza error) ante archivos inválidos', () => {
    const malos = [
      '',
      '{ esto no es json',
      '[]',
      'null',
      '{"variante":"x"}',
      '{"algoritmo":"abb","variante":"0-1","capacidad":5,"objetos":[]}',
      '{"variante":"0-1","capacidad":25,"objetos":[{"nombre":"A","peso":1,"valor":1}]}',
      '{"variante":"0-1","capacidad":5,"objetos":[null]}',
      '{"variante":"0-1","capacidad":5,"objetos":[{"nombre":"A","peso":2.5,"valor":1}]}',
    ]
    for (const t of malos) {
      const r = cargarArchivo(t)
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.length).toBeGreaterThan(0)
    }
  })
})