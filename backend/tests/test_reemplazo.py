

from functools import lru_cache
from itertools import product

import pytest
from fastapi.testclient import TestClient

from app.algorithms.reemplazo import LIMITE_PLANES, resolver
from app.main import app

client = TestClient(app)

EJEMPLO_ENUNCIADO = {
    "algoritmo": "reemplazo-equipos",
    "costoInicial": 500,
    "plazo": 5,
    "vidaUtil": 3,
    "periodos": [
        {"reventa": 400, "mantenimiento": 30},
        {"reventa": 300, "mantenimiento": 40},
        {"reventa": 250, "mantenimiento": 60},
    ],
}

# (nombre, costoInicial, plazo, vidaUtil, reventas, mantenimientos, costo, planes)
CASOS_DE_CLASE = [
    (
        "ejemplo del enunciado",
        500, 5, 3, [400, 300, 250], [30, 40, 60],
        640,
        [[1, 2], [1, 4], [3, 4]],
    ),
    (
        "carro de 5 años (libro de texto)",
        12000, 5, 5, [7000, 6000, 2000, 1000, 0], [2000, 4000, 5000, 9000, 12000],
        31000,
        [[1, 3], [2, 3], [2, 4]],
    ),
    (
        "vida útil de 1 año: se reemplaza cada año",
        100, 4, 1, [60], [10],
        200,  # 4 tramos de (100 + 10 - 60) = 50
        [[1, 2, 3]],
    ),
]


@pytest.mark.parametrize(
    "nombre,costo,plazo,vida,reventa,mant,esperado,planes_esperados",
    CASOS_DE_CLASE,
    ids=[c[0] for c in CASOS_DE_CLASE],
)
def test_ejercicios_de_clase(nombre, costo, plazo, vida, reventa, mant, esperado, planes_esperados):
    r = resolver(costo, plazo, vida, reventa, mant)
    assert r["costoMinimo"] == esperado
    assert sorted(p["reemplazos"] for p in r["planes"]) == sorted(planes_esperados)
    assert r["cantidadPlanes"] == len(planes_esperados)
    assert not r["planesTruncados"]


def test_tabla_g_del_ejemplo_del_enunciado():
    r = resolver(500, 5, 3, [400, 300, 250], [30, 40, 60])
    g = {fila["t"]: (fila["g"], fila["siguientes"]) for fila in r["tabla"]}
    assert g == {
        5: (0, []),
        4: (130, [5]),
        3: (260, [4]),
        2: (380, [5]),
        1: (510, [2, 4]),
        0: (640, [1, 3]),
    }


def _fuerza_bruta(costo, plazo, vida, reventa, mant):
    """Método independiente: prueba todas las formas de partir el plazo."""
    mejor, cuenta = None, 0

    @lru_cache(maxsize=None)
    def tramos(t):
        if t == plazo:
            yield_ = [()]
            return tuple(yield_)
        res = []
        for k in range(1, min(vida, plazo - t) + 1):
            for resto in tramos(t + k):
                res.append((k,) + resto)
        return tuple(res)

    for secuencia in tramos(0):
        total = sum(costo + sum(mant[:k]) - reventa[k - 1] for k in secuencia)
        if mejor is None or total < mejor:
            mejor, cuenta = total, 1
        elif total == mejor:
            cuenta += 1
    return mejor, cuenta


@pytest.mark.parametrize("plazo,vida", [(7, 3), (10, 4), (12, 5), (9, 9), (6, 8)])
def test_coincide_con_fuerza_bruta(plazo, vida):
    costo = 1000
    reventa = [max(0, 800 - 150 * i) for i in range(vida)]
    mant = [40 + 35 * i for i in range(vida)]
    r = resolver(costo, plazo, vida, reventa, mant)
    mejor, cuenta = _fuerza_bruta(costo, plazo, vida, reventa, mant)
    assert r["costoMinimo"] == mejor
    assert r["cantidadPlanes"] == cuenta


def test_decimales_sin_errores_de_redondeo():
    # En punto flotante 0.1 + 0.2 != 0.3, lo que ocultaría este empate exacto:
    # reemplazar al año (0.3 + 0.3) o usar 2 años seguidos (0.6).
    r = resolver(0.1, 2, 2, [0, 0], [0.2, 0.3])
    assert r["costoMinimo"] == 0.6
    assert r["cantidadPlanes"] == 2
    assert sorted(p["reemplazos"] for p in r["planes"]) == [[], [1]]


def test_los_tramos_de_cada_plan_son_consistentes():
    r = resolver(500, 5, 3, [400, 300, 250], [30, 40, 60])
    for plan in r["planes"]:
        tramos = plan["tramos"]
        assert tramos[0]["desde"] == 0 and tramos[-1]["hasta"] == 5
        assert all(a["hasta"] == b["desde"] for a, b in zip(tramos, tramos[1:]))
        assert all(1 <= t["anios"] <= 3 for t in tramos)
        assert sum(t["costo"] for t in tramos) == plan["costo"] == 640


def test_muchos_empates_se_limitan_pero_se_cuentan_todos():
    # Costo lineal: todas las formas de partir el plazo cuestan lo mismo.
    n, m = 30, 10
    r = resolver(0, n, m, [0] * m, [1] * m)

    @lru_cache(maxsize=None)
    def composiciones(t):
        return 1 if t == n else sum(composiciones(t + k) for k in range(1, min(m, n - t) + 1))

    assert r["cantidadPlanes"] == composiciones(0)
    assert r["planesTruncados"] is True
    assert len(r["planes"]) == LIMITE_PLANES
    assert all(p["costo"] == 30 for p in r["planes"])


# ---------------------------------------------------------------- API ----
def test_api_resuelve_el_ejemplo():
    resp = client.post("/api/reemplazo-equipos", json=EJEMPLO_ENUNCIADO)
    assert resp.status_code == 200
    cuerpo = resp.json()
    assert cuerpo["costoMinimo"] == 640
    assert cuerpo["cantidadPlanes"] == 3
    assert cuerpo["planes"][0]["tramos"][0]["desde"] == 0


def _con(**cambios):
    datos = {**EJEMPLO_ENUNCIADO, **cambios}
    return {k: v for k, v in datos.items() if v is not None}


DATOS_INVALIDOS = [
    ("plazo fuera de rango (31)", _con(plazo=31)),
    ("plazo en cero", _con(plazo=0)),
    ("vida útil fuera de rango (11)", _con(vidaUtil=11)),
    ("periodos de menos", _con(periodos=EJEMPLO_ENUNCIADO["periodos"][:2])),
    ("periodos de más", _con(vidaUtil=2)),
    ("costo negativo", _con(costoInicial=-5)),
    ("costo como texto", _con(costoInicial="500")),
    ("campo obligatorio ausente", _con(costoInicial=None)),
    ("plazo decimal", _con(plazo=5.5)),
    ("reventa negativa", _con(periodos=[{"reventa": -1, "mantenimiento": 1}] * 3)),
    ("mantenimiento ausente", _con(periodos=[{"reventa": 1}] * 3)),
    ("algoritmo equivocado", _con(algoritmo="mochila")),
    ("booleano en vez de número", _con(plazo=True)),
]


@pytest.mark.parametrize("nombre,datos", DATOS_INVALIDOS, ids=[d[0] for d in DATOS_INVALIDOS])
def test_api_rechaza_datos_invalidos(nombre, datos):
    resp = client.post("/api/reemplazo-equipos", json=datos)
    assert resp.status_code == 422
    errores = resp.json()["errores"]
    assert errores and all(isinstance(e, str) for e in errores)


def test_api_rechaza_json_mal_formado_sin_caerse():
    resp = client.post(
        "/api/reemplazo-equipos",
        content="{esto no es json",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 422
    assert "errores" in resp.json()


def test_api_mensaje_claro_en_espanol():
    resp = client.post("/api/reemplazo-equipos", json=_con(plazo=31))
    assert resp.json()["errores"] == ["plazo: debe ser menor o igual a 30"]


def test_api_caso_maximo_responde_rapido():
    datos = {
        "costoInicial": 5000,
        "plazo": 30,
        "vidaUtil": 10,
        "periodos": [{"reventa": 4000 - 350 * i, "mantenimiento": 100 + 90 * i} for i in range(10)],
    }
    resp = client.post("/api/reemplazo-equipos", json=datos)
    assert resp.status_code == 200
    assert resp.json()["cantidadPlanes"] >= 1


# ------------------------------------------------ archivos de ejemplo ----
from pathlib import Path  # noqa: E402

EJEMPLOS = Path(__file__).resolve().parents[2] / "ejemplos"


@pytest.mark.parametrize("archivo", sorted(EJEMPLOS.glob("reemplazo-equipos-*.json")), ids=lambda p: p.name)
def test_los_ejemplos_validos_se_resuelven(archivo):
    resp = client.post("/api/reemplazo-equipos", content=archivo.read_bytes(),
                       headers={"Content-Type": "application/json"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["planes"]


@pytest.mark.parametrize("archivo", sorted((EJEMPLOS / "invalidos").glob("*.json")), ids=lambda p: p.name)
def test_los_ejemplos_invalidos_se_rechazan(archivo):
    resp = client.post("/api/reemplazo-equipos", content=archivo.read_bytes(),
                       headers={"Content-Type": "application/json"})
    assert resp.status_code == 422
    assert resp.json()["errores"]

def test_existe_la_carpeta_de_ejemplos():
    validos = list(EJEMPLOS.glob("reemplazo-equipos-*.json"))
    invalidos = list((EJEMPLOS / "invalidos").glob("*.json"))
    assert len(validos) >= 8, f"Faltan los archivos de ejemplo en: {EJEMPLOS}"
    assert len(invalidos) >= 6, f"Faltan los ejemplos inválidos en: {EJEMPLOS / 'invalidos'}"