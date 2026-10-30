import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TablaABB from './TablaABB'

const tableP = [
  [null, null, null],
  [0, 0.4, 1.4],
  [null, 0, 0.6],
  [null, null, 0],
]

describe('TablaABB', () => {
  it('muestra P con 4 decimales y resalta la respuesta P[1][n]', () => {
    render(<TablaABB nombre="P" tabla={tableP} camino={new Set(['1,2', '1,1'])} />)

    expect(screen.getByText('1.4000')).toHaveClass('respuesta')
    expect(screen.getByText('0.4000')).toHaveClass('camino')
  })
})