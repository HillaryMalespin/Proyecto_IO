import { describe, it, expect } from 'vitest'
import {
  EJEMPLO_ENUNCIADO,
  aDatos,
  aFormulario,
  aJSON,
  leerArchivo,
  validarFormulario,
} from './reemplazo'
import type { FormularioReemplazo } from './reemplazo'

const formularioValido = (): FormularioReemplazo => aFormulario(EJEMPLO_ENUNCIADO)

describe('Validación del formulario', () => {
  it('acepta los datos del enunciado', () => {
    const { valido, errores } = validarFormulario(formularioValido())
    expect(valido).toBe(true)
    expect(errores.costoInicial).toBeUndefined()
    expect(aDatos(formularioValido())).toEqual(EJEMPLO_ENUNCIADO)
  })

  it('exige los campos vacíos', () => {
    const f: FormularioReemplazo = { costoInicial: '', plazo: ' ', vidaUtil: '', periodos: [] }
    const { valido, errores } = validarFormulario(f)
    expect(valido).toBe(false)
    expect(errores.costoInicial).toBe('Campo obligatorio')
    expect(errores.plazo).toBe('Campo obligatorio')
    expect(errores.vidaUtil).toBe('Campo obligatorio')
    expect(aDatos(f)).toBeNull()
  })

  it('valida los rangos de plazo (1 a 30) y vida útil (1 a 10)', () => {
    const f = { ...formularioValido(), plazo: '31', vidaUtil: '11' }
    const { errores } = validarFormulario(f)
    expect(errores.plazo).toMatch(/entre 1 y 30/)
    expect(errores.vidaUtil).toMatch(/entre 1 y 10/)
    expect(validarFormulario({ ...formularioValido(), plazo: '0' }).valido).toBe(false)
    expect(validarFormulario({ ...formularioValido(), plazo: '2.5' }).valido).toBe(false)
  })

  it('rechaza textos y negativos en los montos, y acepta coma decimal', () => {
    const f = formularioValido()
    f.costoInicial = 'abc'
    f.periodos[0].reventa = '-5'
    f.periodos[1].mantenimiento = ''
    const { errores } = validarFormulario(f)
    expect(errores.costoInicial).toMatch(/número/)
    expect(errores.periodos[0].reventa).toBe('No puede ser negativo')
    expect(errores.periodos[1].mantenimiento).toBe('Campo obligatorio')

    const coma = { ...formularioValido(), costoInicial: '12,5' }
    expect(aDatos(coma)?.costoInicial).toBe(12.5)
  })
})

describe('Archivos .json', () => {
  it('carga un archivo válido y lo guarda con el mismo formato', () => {
    const lectura = leerArchivo(aJSON(EJEMPLO_ENUNCIADO))
    expect(lectura).toEqual({ ok: true, datos: EJEMPLO_ENUNCIADO })
  })

  it('tolera el BOM que agrega el Bloc de notas', () => {
    expect(leerArchivo('\uFEFF' + aJSON(EJEMPLO_ENUNCIADO)).ok).toBe(true)
  })

  it('muestra mensajes (nunca errores) ante archivos inválidos', () => {
    const casos = [
      '',
      '   ',
      'esto no es json',
      'null',
      '[]',
      '5',
      '{}',
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, algoritmo: 'mochila' }),
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, plazo: 31 }),
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, costoInicial: '500' }),
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, periodos: EJEMPLO_ENUNCIADO.periodos.slice(0, 2) }),
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, periodos: [1, null, 'x'] }),
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, periodos: 'no' }),
    ]
    for (const texto of casos) {
      const lectura = leerArchivo(texto)
      expect(lectura.ok).toBe(false)
      if (!lectura.ok) {
        expect(lectura.errores.length).toBeGreaterThan(0)
        expect(lectura.errores.every((e) => typeof e === 'string' && e.length > 0)).toBe(true)
      }
    }
  })

  it('explica la causa cuando faltan periodos', () => {
    const lectura = leerArchivo(
      JSON.stringify({ ...EJEMPLO_ENUNCIADO, periodos: EJEMPLO_ENUNCIADO.periodos.slice(0, 2) }),
    )
    expect(lectura.ok).toBe(false)
    if (!lectura.ok) expect(lectura.errores[0]).toMatch(/exactamente 3 elementos/)
  })
})
