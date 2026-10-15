import type { CSSProperties } from 'react'

const N = 5

export default function TablaDP() {
  const celdas = Array.from({ length: N * N }, (_, k) => ({ i: Math.floor(k / N), j: k % N }))

  return (
    <div className="tabla-dp" aria-hidden="true">
      {celdas.map(({ i, j }) => {
        const clase = j < i ? 'celda' : i === 0 && j === N - 1 ? 'celda llena respuesta' : 'celda llena'
        return <span key={`${i}-${j}`} className={clase} style={{ '--d': j - i } as CSSProperties} />
      })}
    </div>
  )
}