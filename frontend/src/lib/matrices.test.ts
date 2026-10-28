import { describe, expect, it } from 'vitest'
import { cargarArchivo, validarFormulario } from './matrices'

describe('validación de multiplicación de matrices', () => {
  it('convierte dimensiones válidas al contrato del backend', () => {
    const resultado = validarFormulario({ cantidad: '4', dimensiones: ['30', '35', '15', '5', '10'] })
    expect(resultado.problema).toEqual({
      algoritmo: 'multiplicacion-matrices',
      dimensiones: [30, 35, 15, 5, 10],
    })
  })

  it('rechaza dimensiones no positivas o cantidad fuera de rango', () => {
    expect(validarFormulario({ cantidad: '1', dimensiones: ['30', '0'] }).problema).toBeNull()
    expect(validarFormulario({ cantidad: '2', dimensiones: ['30', '-5', '10'] }).problema).toBeNull()
  })

  it('carga el formato JSON del ejercicio', () => {
    const resultado = cargarArchivo(JSON.stringify({
      algoritmo: 'multiplicacion-matrices',
      dimensiones: [30, 35, 15, 5, 10],
    }))
    expect(resultado).toEqual({
      ok: true,
      formulario: { cantidad: '4', dimensiones: ['30', '35', '15', '5', '10'] },
    })
  })
})
