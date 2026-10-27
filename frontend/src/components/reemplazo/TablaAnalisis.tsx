import { formatear, type Resultado } from '../../lib/reemplazo'

export default function TablaAnalisis({ resultado }: { resultado: Resultado }) {
  const gDe = new Map(resultado.tabla.map((f) => [f.t, f.g]))

  return (
    <section className="panel" aria-labelledby="titulo-tabla">
      <h2 id="titulo-tabla">Tabla de análisis</h2>
      <p className="ayuda">
        G(t) es el costo mínimo desde el instante t hasta el final del proyecto, comprando un equipo
        nuevo en t. Se calcula de atrás hacia adelante. Cada alternativa se lee como:
        costo del tramo + G(j) = total.
      </p>
      <div className="tabla-scroll" role="region" aria-label="Tabla de análisis de cada período" tabIndex={0}>
        <table className="tabla-analisis">
          <thead>
            <tr>
              <th scope="col">t</th>
              <th scope="col">Alternativas (reemplazar en j)</th>
              <th scope="col">G(t)</th>
              <th scope="col">Próximo reemplazo</th>
            </tr>
          </thead>
          <tbody>
            {resultado.tabla.map((fila) => (
              <tr key={fila.t}>
                <th scope="row">{fila.t}</th>
                <td>
                  {fila.alternativas.length === 0 ? (
                    <span className="ayuda">Fin del proyecto</span>
                  ) : (
                    <ul className="alternativas">
                      {fila.alternativas.map((a) => (
                        <li key={a.reemplazoEn} className={a.optima ? 'optima' : undefined}>
                          {a.optima ? '✓ ' : ''}j = {a.reemplazoEn}: {formatear(a.costoTramo)} +{' '}
                          {formatear(gDe.get(a.reemplazoEn) ?? 0)} = {formatear(a.total)}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="num">{formatear(fila.g)}</td>
                <td>
                  {fila.siguientes.length === 0
                    ? '—'
                    : fila.siguientes
                        .map((j) => (j === resultado.plazo ? `${j} (fin)` : String(j)))
                        .join(' o ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
