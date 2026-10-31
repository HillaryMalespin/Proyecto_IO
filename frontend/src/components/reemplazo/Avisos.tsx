import { aniosConReventaAlta } from '../../lib/avisos'
import { formatear } from '../../lib/reemplazo'

interface DatosAviso {
  costoInicial: string
  periodos: { reventa: string }[]
}

/** Aviso (no bloquea) cuando la reventa de algún año supera el costo inicial. */
export function AvisoReventa({ formulario }: { formulario: DatosAviso }) {
  const anios = aniosConReventaAlta(
    formulario.costoInicial,
    formulario.periodos.map((p) => p.reventa),
  )
  if (anios.length === 0) return null
  const costo = Number(formulario.costoInicial.trim().replace(',', '.'))

  return (
    <div className="mensaje" role="note">
      <p className="mensaje-titulo">Revise los datos: la reventa supera el costo inicial</p>
      <p>
        {anios.length === 1 ? `En el año ${anios[0]}` : `En los años ${anios.join(', ')}`} el precio de
        reventa es mayor que el costo inicial ({formatear(costo)}). Si el equipo se vende por más de lo que
        costó, el costo total puede resultar negativo (una ganancia neta). Si fue un error de digitación,
        corríjalo; si es correcto, puede calcular de todos modos.
      </p>
    </div>
  )
}

/** Explica un costo mínimo negativo en el resultado. */
export function NotaGanancia({ costoMinimo }: { costoMinimo: number }) {
  if (costoMinimo >= 0) return null
  return (
    <p className="mensaje" role="note" style={{ marginTop: '1rem' }}>
      El costo mínimo es negativo: el mejor plan deja una ganancia neta de{' '}
      <strong>{formatear(-costoMinimo)}</strong>, porque las reventas superan lo que cuesta comprar y
      mantener los equipos.
    </p>
  )
}
