import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Menu from './Menu'
import type { Algoritmo } from '../algoritmos'

const montar = () => render(<MemoryRouter><Menu /></MemoryRouter>)

// Datos propios de la prueba: no dependen de qué proyectos estén terminados.
const PRUEBA: Algoritmo[] = [
  { id: 'listo', nombre: 'Algoritmo listo', descripcion: 'Ya disponible.', ruta: '/listo', disponible: true },
  { id: 'pendiente', nombre: 'Algoritmo pendiente', descripcion: 'Aún no.', ruta: '/pendiente', disponible: false },
]

describe('Menú principal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) }))
  })

  it('muestra las cinco opciones con su tooltip', () => {
    montar()
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getAllByRole('tooltip', { hidden: true })).toHaveLength(5)
    expect(screen.getByText('Problema de la Mochila')).toBeInTheDocument()
  })

  it('muestra servicio activo cuando el backend responde', async () => {
    montar()
    expect(await screen.findByText(/servicio activo/i)).toBeInTheDocument()
  })

  it('muestra mensaje claro (no error) si el backend no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('caído')))
    montar()
    expect(await screen.findByText(/servicio no disponible/i)).toBeInTheDocument()
  })

  it('alerta si el algoritmo no está disponible', () => {
    render(<MemoryRouter><Menu opciones={PRUEBA} /></MemoryRouter>)
    fireEvent.click(screen.getByText('Algoritmo pendiente'))
    expect(screen.getByRole('alert')).toHaveTextContent(/no está disponible/i)
  })

  it('no muestra alerta si el algoritmo está disponible', () => {
    render(<MemoryRouter><Menu opciones={PRUEBA} /></MemoryRouter>)
    fireEvent.click(screen.getByText('Algoritmo listo'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('la mochila ya está disponible: no muestra alerta al abrirla', () => {
    montar()
    fireEvent.click(screen.getByText('Problema de la Mochila'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})