interface Props {
  nombre: 'P' | 'R'
  tabla: (number | null)[][]
  camino: Set<string>
}

const DESCRIPCION = {
  P: 'Tabla P: costo esperado mínimo del subárbol con las llaves Kᵢ a Kⱼ.',
  R: 'Tabla R: raíz óptima del subárbol con las llaves Kᵢ a Kⱼ.',
}

export default function TablaABB({ nombre, tabla, camino }: Props) {
  if (tabla.length < 2) return null

  const n = tabla.length - 2
  const columnas = tabla[0].length // n + 1 (j = 0..n)
  const filas = tabla.slice(1)     // la fila 0 es relleno (todo null)

  const formato = (valor: number | null) => {
    if (valor === null) return '-'
    return nombre === 'P' ? valor.toFixed(4) : String(valor)
  }

  return (
    <div className="tabla-scroll">
      <table className="tabla-mochila tabla-abb">
        <caption>{DESCRIPCION[nombre]}</caption>
        <thead>
          <tr>
            <th scope="col">{nombre}</th>
            {Array.from({ length: columnas }, (_, j) => <th scope="col" key={j}>{j}</th>)}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, f) => {
            const i = f + 1
            return (
              <tr key={i}>
                <th scope="row">{i}</th>
                {fila.map((valor, j) => {
                  const clase =
                    i === 1 && j === n ? 'respuesta'
                    : camino.has(`${i},${j}`) ? 'camino'
                    : undefined
                  return <td key={j} className={clase}>{formato(valor)}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}