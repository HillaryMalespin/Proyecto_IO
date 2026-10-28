interface Props {
  nombre: 'M' | 'P'
  tabla: (number | null)[][]
}

export default function TablaMatrices({ nombre, tabla }: Props) {
  return (
    <div className="tabla-scroll">
      <table className="tabla-mochila tabla-matrices">
        <caption>Tabla {nombre}: filas y columnas representan los índices de matrices.</caption>
        <thead>
          <tr>
            <th scope="col">{nombre}</th>
            {tabla.map((_, indice) => <th scope="col" key={indice}>{indice}</th>)}
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila, i) => (
            <tr key={i}>
              <th scope="row">{i}</th>
              {fila.map((valor, j) => (
                <td
                  key={j}
                  className={valor !== null && i === 1 && j === tabla.length - 1 ? 'respuesta' : undefined}
                >
                  {valor ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
