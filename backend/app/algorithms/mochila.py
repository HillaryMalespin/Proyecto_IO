from typing import Any


def resolver_mochila(variante: str, capacidad: int, objetos: list[dict[str, Any]]) -> dict[str, Any]:
    """Resuelve la mochila por programacion dinamica.

    tabla[i][c] = mejor valor usando solo los primeros i objetos con capacidad c.
    La fila 0 (sin objetos) y la columna 0 (capacidad 0) valen 0.
    """
    n = len(objetos)
    tabla = [[0] * (capacidad + 1) for _ in range(n + 1)]
    # elegido[i][c] = cuantas copias del objeto i se usaron en la mejor solucion de tabla[i][c]
    elegido = [[0] * (capacidad + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        peso = objetos[i - 1]["peso"]
        valor = objetos[i - 1]["valor"]

        # Lo unico que cambia entre variantes es cuantas copias maximo se pueden usar
        if variante == "0-1":
            tope = 1
        elif variante == "acotada":
            tope = objetos[i - 1]["cantidad"]
        else:  # no-acotada
            tope = capacidad // peso

        for c in range(capacidad + 1):
            mejor, mejor_k = tabla[i - 1][c], 0  # k = 0: no uso el objeto i
            # Pruebo k copias, sin pasarme del tope ni de la capacidad c
            for k in range(1, min(tope, c // peso) + 1):
                candidato = tabla[i - 1][c - k * peso] + k * valor
                if candidato > mejor:  # ">" estricto: en empate prefiere usar menos objetos
                    mejor, mejor_k = candidato, k
            tabla[i][c] = mejor
            elegido[i][c] = mejor_k

    # Reconstruccion: parto de la esquina inferior derecha y subo fila por fila
    seleccion = []
    c = capacidad
    for i in range(n, 0, -1):
        k = elegido[i][c]
        if k > 0:
            obj = objetos[i - 1]
            seleccion.append({"nombre": obj["nombre"], "peso": obj["peso"], "valor": obj["valor"], "cantidad": k})
            c -= k * obj["peso"]  # libero la capacidad que ocupo ese objeto
    seleccion.reverse()  # quedan en el mismo orden que el usuario los ingreso

    return {
        "valor_optimo": tabla[n][capacidad],
        "tabla": tabla,
        "elegido": elegido,
        "seleccion": seleccion,
    }