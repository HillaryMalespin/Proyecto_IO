import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Mochila from './Mochila'

const montar = () => render(<MemoryRouter><Mochila /></MemoryRouter>)
const escribir = (etiqueta: RegExp | string, valor: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

describe('Página de la mochila', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra errores y no llama al backend si los datos son inválidos', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    montar()
    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))
    expect(screen.getByText(/la capacidad es obligatoria/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envía el problema al backend y muestra el valor óptimo y la tabla', async () => {
    const respuesta = {
      valor_optimo: 40,
      tabla: [[0, 0], [0, 40]],
      elegido: [[0, 0], [0, 1]],
      seleccion: [{ nombre: 'B', peso: 1, valor: 40, cantidad: 1 }],
    }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => respuesta })
    vi.stubGlobal('fetch', fetchMock)
    montar()
    escribir(/capacidad de la mochila/i, '1')
    escribir('Nombre', 'B')
    escribir('Peso', '1')
    escribir('Valor', '40')
    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))

    expect(await screen.findByText(/valor óptimo/i)).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    const cuerpo = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(cuerpo).toMatchObject({ variante: '0-1', capacidad: 1, objetos: [{ nombre: 'B', peso: 1, valor: 40 }] })
  })

  it('muestra un mensaje claro si el backend no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('caído')))
    montar()
    escribir(/capacidad de la mochila/i, '1')
    escribir('Nombre', 'B')
    escribir('Peso', '1')
    escribir('Valor', '40')
    fireEvent.click(screen.getByRole('button', { name: /resolver/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo conectar/i))
  })
})