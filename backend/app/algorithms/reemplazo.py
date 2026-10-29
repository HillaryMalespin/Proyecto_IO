"""Problema de reemplazo de equipos resuelto con programación dinámica.

Sea G(t) el costo mínimo de operar desde el instante t hasta el final del
proyecto (instante n), sabiendo que en el instante t se compra un equipo nuevo.

    G(n) = 0
    G(t) = min { C(t, t+k) + G(t+k) }          k = 1 .. min(vida_util, n - t)

    C(t, t+k) = costo_inicial + (mantenimiento_1 + ... + mantenimiento_k) - reventa_k

C(t, t+k) es el costo de comprar un equipo en t, usarlo k años y venderlo en
t+k. La respuesta del problema es G(0). Los "siguientes reemplazos" de t son
todos los instantes t+k que alcanzan el mínimo (puede haber empates).

Los cálculos se hacen con Decimal para que los empates se detecten de forma
exacta, sin errores de redondeo de punto flotante.
"""

from decimal import Decimal

# Si hay muchísimos planes óptimos (empates), solo se devuelven los primeros.
# La cantidad total siempre se calcula completa.
LIMITE_PLANES = 500


def _dec(valor) -> Decimal:
    return valor if isinstance(valor, Decimal) else Decimal(str(valor))


def _num(valor: Decimal) -> float:
    return float(valor)


def resolver(
    costo_inicial,
    plazo: int,
    vida_util: int,
    reventa: list,
    mantenimiento: list,
    limite_planes: int = LIMITE_PLANES,
) -> dict:
    """Resuelve el problema y devuelve la tabla de análisis y los planes óptimos.

    reventa[i] y mantenimiento[i] corresponden al año i+1 de uso del equipo.
    """
    n = plazo
    c = _dec(costo_inicial)
    rev = [_dec(x) for x in reventa]
    man = [_dec(x) for x in mantenimiento]

    # mantenimiento acumulado tras k años de uso
    acumulado = [Decimal(0)]
    for m in man:
        acumulado.append(acumulado[-1] + m)

    def costo_tramo(k: int) -> Decimal:
        return c + acumulado[k] - rev[k - 1]

    g = [Decimal(0)] * (n + 1)
    siguientes: list[list[int]] = [[] for _ in range(n + 1)]
    tabla = [{"t": n, "g": 0.0, "siguientes": [], "alternativas": []}]

    for t in range(n - 1, -1, -1):
        candidatas = []
        for k in range(1, min(vida_util, n - t) + 1):
            j = t + k
            tramo = costo_tramo(k)
            candidatas.append((j, tramo, tramo + g[j]))

        g[t] = min(total for _, _, total in candidatas)
        siguientes[t] = [j for j, _, total in candidatas if total == g[t]]
        tabla.append(
            {
                "t": t,
                "g": _num(g[t]),
                "siguientes": siguientes[t],
                "alternativas": [
                    {
                        "reemplazoEn": j,
                        "costoTramo": _num(tramo),
                        "total": _num(total),
                        "optima": total == g[t],
                    }
                    for j, tramo, total in candidatas
                ],
            }
        )

    # Cantidad exacta de planes óptimos (caminos de 0 a n por los óptimos)
    cuenta = [0] * (n + 1)
    cuenta[n] = 1
    for t in range(n - 1, -1, -1):
        cuenta[t] = sum(cuenta[j] for j in siguientes[t])

    planes = []

    def recorrer(t: int, camino: list[int]) -> None:
        if len(planes) >= limite_planes:
            return
        if t == n:
            planes.append(camino[:])
            return
        for j in siguientes[t]:
            camino.append(j)
            recorrer(j, camino)
            camino.pop()
            if len(planes) >= limite_planes:
                return

    recorrer(0, [0])

    def detallar(camino: list[int]) -> dict:
        # camino = [0, t1, t2, ..., n]: instantes en que se compra un equipo,
        # más el final del proyecto.
        tramos = []
        for desde, hasta in zip(camino, camino[1:]):
            k = hasta - desde
            tramos.append(
                {
                    "desde": desde,
                    "hasta": hasta,
                    "anios": k,
                    "compra": _num(c),
                    "mantenimiento": _num(acumulado[k]),
                    "reventa": _num(rev[k - 1]),
                    "costo": _num(costo_tramo(k)),
                }
            )
        return {"reemplazos": camino[1:-1], "costo": _num(g[0]), "tramos": tramos}

    return {
        "algoritmo": "reemplazo-equipos",
        "plazo": n,
        "costoMinimo": _num(g[0]),
        "tabla": tabla,
        "cantidadPlanes": cuenta[0],
        "planesTruncados": cuenta[0] > len(planes),
        "planes": [detallar(p) for p in planes],
    }