import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Menu from './Menu'

const montar = () => render(<MemoryRouter><Menu /></MemoryRouter>)

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
    montar()
    fireEvent.click(screen.getByText('Series Deportivas'))
    expect(screen.getByRole('alert')).toHaveTextContent(/no está disponible/i)
  })

  it('la mochila ya está disponible: no muestra alerta al abrirla', () => {
    montar()
    fireEvent.click(screen.getByText('Problema de la Mochila'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})