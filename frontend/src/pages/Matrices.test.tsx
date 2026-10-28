import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Matrices from './Matrices'

const montar = () => render(<MemoryRouter><Matrices /></MemoryRouter>)
const escribir = (etiqueta: RegExp | string, valor: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

describe('Página de multiplicación de matrices', () => {
  beforeEach(() => vi.unstubAllGlobals())

  it('muestra errores y no llama al backend si faltan dimensiones', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    montar()
    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))
    expect(screen.getByText(/la dimensión d0 es obligatoria/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envía las dimensiones y muestra M, P y la parentización', async () => {
    const respuesta = {
      dimensiones: [30, 35, 15],
      n: 2,
      tableM: [[null, null, null], [null, 0, 1575], [null, null, 0]],
      tableP: [[null, null, null], [null, 1, 1], [null, null, 2]],
      parentizacion: '(A1A2)',
      costo: 1575,
    }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => respuesta })
    vi.stubGlobal('fetch', fetchMock)
    montar()
    escribir(/d0/i, '30')
    escribir(/d1/i, '35')
    escribir(/d2/i, '15')
    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))

    expect(await screen.findByText('(A1A2)')).toBeInTheDocument()
    expect(screen.getByText('Tabla M')).toBeInTheDocument()
    expect(screen.getByText('Tabla P')).toBeInTheDocument()
    const cuerpo = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(cuerpo).toEqual({ algoritmo: 'multiplicacion-matrices', dimensiones: [30, 35, 15] })
  })
})
