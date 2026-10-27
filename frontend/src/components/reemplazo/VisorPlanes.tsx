import { useState } from 'react'
import type { CSSProperties } from 'react'
import { formatear, type Resultado } from '../../lib/reemplazo'
import './reemplazo.css'

export default function VisorPlanes({ resultado }: { resultado: Resultado }) {
  const [indice, setIndice] = useState(0)
  const { planes, cantidadPlanes, planesTruncados } = resultado
  const plan = planes[indice]
  if (!plan) return null

  return (
    <section className="panel" aria-labelledby="titulo-planes">
      <h2 id="titulo-planes">{cantidadPlanes === 1 ? 'Plan óptimo' : 'Planes óptimos'}</h2>
      <p className="ayuda">
        {cantidadPlanes === 1
          ? 'Existe un único plan que alcanza el costo mínimo.'
          : `Hay ${formatear(cantidadPlanes)} planes que alcanzan el costo mínimo. Recórralos con los botones.`}
        {planesTruncados ? ` Se muestran los primeros ${formatear(planes.length)}.` : ''}
      </p>

      <div className="navegador-planes">
        <button type="button" className="boton" onClick={() => setIndice(indice - 1)} disabled={indice === 0}>
          Plan anterior
        </button>
        <p className="indicador" aria-live="polite">
          Plan {indice + 1} de {formatear(cantidadPlanes)}
        </p>
        <button
          type="button"
          className="boton"
          onClick={() => setIndice(indice + 1)}
          disabled={indice >= planes.length - 1}
        >
          Plan siguiente
        </button>
      </div>

      <p className="resumen-plan">
        {plan.reemplazos.length === 0
          ? 'Sin reemplazos: se conserva el equipo inicial hasta el final del proyecto.'
          : `Reemplazos en los instantes: ${plan.reemplazos.join(', ')}.`}{' '}
        <strong>Costo total: {formatear(plan.costo)}</strong>
      </p>

      <ol className="linea" aria-label="Línea de tiempo del plan">
        {plan.tramos.map((t, i) => (
          <li
            key={t.desde}
            className="segmento"
            style={{ '--anios': t.anios } as CSSProperties}
            title={`Equipo ${i + 1}: de ${t.desde} a ${t.hasta}, costo neto ${formatear(t.costo)}`}
          >
            <span className="segmento-num">{i + 1}</span>
            <span className="segmento-rango">
              {t.desde}–{t.hasta}
            </span>
          </li>
        ))}
      </ol>

      <div className="tabla-scroll" role="region" aria-label="Detalle de cada equipo del plan" tabIndex={0}>
        <table className="tabla-analisis">
          <thead>
            <tr>
              <th scope="col">Equipo</th>
              <th scope="col">Compra en</th>
              <th scope="col">Venta en</th>
              <th scope="col">Años</th>
              <th scope="col">Compra</th>
              <th scope="col">Mantenimiento</th>
              <th scope="col">Reventa</th>
              <th scope="col">Costo neto</th>
            </tr>
          </thead>
          <tbody>
            {plan.tramos.map((t, i) => (
              <tr key={t.desde}>
                <th scope="row">{i + 1}</th>
                <td className="num">{t.desde}</td>
                <td className="num">{t.hasta}</td>
                <td className="num">{t.anios}</td>
                <td className="num">{formatear(t.compra)}</td>
                <td className="num">{formatear(t.mantenimiento)}</td>
                <td className="num">{formatear(t.reventa)}</td>
                <td className="num">{formatear(t.costo)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={7}>Total</th>
              <td className="num">{formatear(plan.costo)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
