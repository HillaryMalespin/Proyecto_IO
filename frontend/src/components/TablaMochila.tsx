import type { Objeto } from '../lib/mochila'
import { formatear } from '../lib/mochila'

interface Props {
  tabla: number[][] // tabla[i][c]: mejor valor con los primeros i objetos y capacidad c
  elegido: number[][] // elegido[i][c]: copias del objeto i usadas en esa celda
  objetos: Objeto[]
  capacidad: number
}

export default function TablaMochila({ tabla, elegido, objetos, capacidad }: Props) {
  // Recorro la tabla hacia atras desde la esquina inferior derecha para marcar
  // las celdas por donde pasa la solucion. Guardo cuantas copias se tomaron en cada una.
  const camino = new Map<string, number>()
  let c = capacidad
  for (let i = objetos.length; i >= 1; i--) {
    const k = elegido[i][c]
    camino.set(`${i},${c}`, k)
    c -= k * objetos[i - 1].peso
  }

  return (
    <div className="tabla-scroll">
      <table className="tabla-mochila">
        <caption>Filas: objetos considerados. Columnas: capacidad disponible.</caption>
        <thead>
          <tr>
            <th scope="col">Objeto</th>
            {Array.from({ length: capacidad + 1 }, (_, j) => (
              <th scope="col" key={j}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila, i) => (
            <tr key={i}>
              <th scope="row">
                {i === 0 ? (
                  'Sin objetos'
                ) : (
                  <>
                    {objetos[i - 1].nombre}
                    <small> p={objetos[i - 1].peso} v={formatear(objetos[i - 1].valor)}</small>
                  </>
                )}
              </th>
              {fila.map((valor, j) => {
                const copias = camino.get(`${i},${j}`)
                const clases = [
                  copias !== undefined ? 'camino' : '',
                  i === objetos.length && j === capacidad ? 'respuesta' : '',
                ].join(' ').trim()
                return (
                  <td key={j} className={clases || undefined}>
                    {formatear(valor)}
                    {/* En el camino, muestro cuantas copias se toman del objeto */}
                    {copias !== undefined && copias > 0 && <span className="copias">×{copias}</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}