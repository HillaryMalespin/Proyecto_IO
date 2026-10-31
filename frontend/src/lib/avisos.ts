// Avisos (no bloquean el cálculo) sobre datos que suelen ser errores de digitación.

function numero(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  return /^-?\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : null
}

/** Años (1, 2, ...) cuyo precio de reventa supera el costo inicial. Ignora campos vacíos o inválidos. */
export function aniosConReventaAlta(costoInicial: string, reventas: string[]): number[] {
  const costo = numero(costoInicial)
  if (costo === null || costo < 0) return []
  const anios: number[] = []
  reventas.forEach((texto, i) => {
    const reventa = numero(texto)
    if (reventa !== null && reventa > costo) anios.push(i + 1)
  })
  return anios
}
