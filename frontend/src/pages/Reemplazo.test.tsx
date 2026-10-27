import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Reemplazo from './Reemplazo'
import { EJEMPLO_ENUNCIADO, aJSON } from '../lib/reemplazo'

const RESULTADO = {
  algoritmo: 'reemplazo-equipos',
  plazo: 5,
  costoMinimo: 640,
  tabla: [
    { t: 5, g: 0, siguientes: [], alternativas: [] },
    { t: 4, g: 130, siguientes: [5], alternativas: [{ reemplazoEn: 5, costoTramo: 130, total: 130, optima: true }] },
    {
      t: 0,
      g: 640,
      siguientes: [1, 3],
      alternativas: [
        { reemplazoEn: 1, costoTramo: 130, total: 640, optima: true },
        { reemplazoEn: 3, costoTramo: 380, total: 640, optima: true },
      ],
    },
  ],
  cantidadPlanes: 2,
  planesTruncados: false,
  planes: [
    {
      reemplazos: [1, 2],
      costo: 640,
      tramos: [
        { desde: 0, hasta: 1, anios: 1, compra: 500, mantenimiento: 30, reventa: 400, costo: 130 },
        { desde: 1, hasta: 2, anios: 1, compra: 500, mantenimiento: 30, reventa: 400, costo: 130 },
        { desde: 2, hasta: 5, anios: 3, compra: 500, mantenimiento: 130, reventa: 250, costo: 380 },
      ],
    },
    {
      reemplazos: [3],
      costo: 640,
      tramos: [
        { desde: 0, hasta: 3, anios: 3, compra: 500, mantenimiento: 130, reventa: 250, costo: 380 },
        { desde: 3, hasta: 5, anios: 2, compra: 500, mantenimiento: 70, reventa: 300, costo: 270 },
      ],
    },
  ],
}

const montar = () => render(<MemoryRouter><Reemplazo /></MemoryRouter>)

function cargarArchivo(contenido: string) {
  const entrada = screen.getByLabelText(/archivo json con los datos/i)
  const archivo = new File([contenido], 'prueba.json', { type: 'application/json' })
  fireEvent.change(entrada, { target: { files: [archivo] } })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => RESULTADO })
  vi.stubGlobal('fetch', fetchMock)
})

describe('Pantalla de Reemplazo de Equipos', () => {
  it('muestra errores claros y no llama al backend si el formulario está vacío', () => {
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(screen.getAllByText('Campo obligatorio').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('alert')).toHaveTextContent(/revise los datos/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('valida mientras se escribe y genera las filas según la vida útil', () => {
    montar()
    fireEvent.change(screen.getByLabelText(/plazo/i), { target: { value: '31' } })
    expect(screen.getByText(/entre 1 y 30/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/vida útil/i), { target: { value: '2' } })
    expect(screen.getByLabelText('Precio de reventa, año 2')).toBeInTheDocument()
    expect(screen.queryByLabelText('Precio de reventa, año 3')).not.toBeInTheDocument()
  })

  it('muestra un mensaje (no un error) al cargar un archivo inválido', async () => {
    montar()
    cargarArchivo('esto no es json')
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo cargar "prueba.json"/i)
    expect(screen.getByRole('alert')).toHaveTextContent(/json válido/i)
  })

  it('carga un archivo válido, calcula y permite recorrer los planes óptimos', async () => {
    montar()
    cargarArchivo(aJSON(EJEMPLO_ENUNCIADO))
    expect(await screen.findByDisplayValue('500')).toBeInTheDocument()
    expect(screen.getByLabelText('Costo de mantenimiento, año 3')).toHaveValue('60')

    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(await screen.findByText('Plan 1 de 2')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opciones] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/reemplazo-equipos')
    expect(JSON.parse(opciones.body)).toEqual(EJEMPLO_ENUNCIADO)
    expect(screen.getByText(/reemplazos en los instantes: 1, 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Plan siguiente' }))
    expect(screen.getByText('Plan 2 de 2')).toBeInTheDocument()
    expect(screen.getByText(/reemplazos en los instantes: 3/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plan siguiente' })).toBeDisabled()
  })

  it('muestra los mensajes del backend cuando rechaza los datos', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ errores: ['plazo: debe ser menor o igual a 30'] }),
    })
    montar()
    cargarArchivo(aJSON(EJEMPLO_ENUNCIADO))
    await screen.findByDisplayValue('500')
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('plazo: debe ser menor o igual a 30')
  })

  it('avisa con claridad si no hay conexión con el backend', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo conectar/i))
  })
})
