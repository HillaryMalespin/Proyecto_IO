import itertools
import random

import pytest
from fastapi.testclient import TestClient

from app.algorithms.mochila import resolver_mochila
from app.main import app

client = TestClient(app)


def objs(*datos):
    """Atajo: objs(("A", peso, valor[, cantidad]), ...) -> lista de dicts."""
    res = []
    for d in datos:
        o = {"nombre": d[0], "peso": d[1], "valor": d[2]}
        if len(d) > 3:
            o["cantidad"] = d[3]
        res.append(o)
    return res


# ---------- Ejercicios resueltos (tabla clasica de 0/1, enunciado, no acotada) ----------

def test_01_tabla_clasica():
    # Ejemplo clasico de libro de texto: C = 5, objetos (peso, valor) = (2,3) (3,4) (4,5) (5,6)
    r = resolver_mochila("0-1", 5, objs(("1", 2, 3), ("2", 3, 4), ("3", 4, 5), ("4", 5, 6)))
    assert r["tabla"] == [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        [0, 0, 3, 4, 5, 7],
        [0, 0, 3, 4, 5, 7],
    ]
    assert r["valor_optimo"] == 7
    assert [s["nombre"] for s in r["seleccion"]] == ["1", "2"]


def test_acotada_ejemplo_del_enunciado():
    r = resolver_mochila(
        "acotada", 15, objs(("Linterna", 2, 10, 3), ("Agua", 5, 18, 2), ("Botiquín", 4, 15, 1))
    )
    assert r["valor_optimo"] == 63
    cantidades = {s["nombre"]: s["cantidad"] for s in r["seleccion"]}
    assert cantidades == {"Linterna": 3, "Agua": 1, "Botiquín": 1}


def test_no_acotada_repite_objetos():
    # Con capacidad 10 conviene llevar dos veces la Manta (peso 5, valor 7)
    r = resolver_mochila("no-acotada", 10, objs(("Cuerda", 3, 4), ("Pan", 4, 5), ("Manta", 5, 7)))
    assert r["valor_optimo"] == 14
    assert r["seleccion"] == [{"nombre": "Manta", "peso": 5, "valor": 7, "cantidad": 2}]


# ---------- Verificacion contra fuerza bruta ----------

def fuerza_bruta(variante, capacidad, objetos):
    """Prueba TODAS las combinaciones de cantidades. Lento pero obviamente correcto."""
    rangos = []
    for o in objetos:
        if variante == "0-1":
            tope = 1
        elif variante == "acotada":
            tope = o["cantidad"]
        else:
            tope = capacidad // o["peso"]
        rangos.append(range(min(tope, capacidad // o["peso"]) + 1))
    mejor = 0
    for combo in itertools.product(*rangos):
        peso = sum(k * o["peso"] for k, o in zip(combo, objetos))
        if peso <= capacidad:
            mejor = max(mejor, sum(k * o["valor"] for k, o in zip(combo, objetos)))
    return mejor


def test_coincide_con_fuerza_bruta_en_casos_aleatorios():
    azar = random.Random(2026)  # semilla fija: la prueba siempre es la misma
    for _ in range(150):
        variante = azar.choice(["0-1", "acotada", "no-acotada"])
        capacidad = azar.randint(1, 12)
        n = azar.randint(1, 4)
        objetos = [
            {"nombre": f"o{i}", "peso": azar.randint(1, 8), "valor": azar.randint(1, 30),
             "cantidad": azar.randint(1, 3)}
            for i in range(n)
        ]
        r = resolver_mochila(variante, capacidad, objetos)
        assert r["valor_optimo"] == fuerza_bruta(variante, capacidad, objetos)
        # La seleccion devuelta debe ser coherente: cabe y suma el valor optimo
        assert sum(s["peso"] * s["cantidad"] for s in r["seleccion"]) <= capacidad
        assert sum(s["valor"] * s["cantidad"] for s in r["seleccion"]) == r["valor_optimo"]


def test_objeto_mas_pesado_que_la_capacidad_no_se_elige():
    r = resolver_mochila("0-1", 3, objs(("Pesado", 10, 99)))
    assert r["valor_optimo"] == 0
    assert r["seleccion"] == []


# ---------- API: resolver y rechazar datos invalidos ----------

def problema(**cambios):
    base = {
        "algoritmo": "mochila",
        "variante": "0-1",
        "capacidad": 10,
        "objetos": [{"nombre": "A", "peso": 5, "valor": 10}, {"nombre": "B", "peso": 4, "valor": 40}],
    }
    base.update(cambios)
    return base


def test_api_resuelve_un_problema_valido():
    r = client.post("/api/mochila", json=problema())
    assert r.status_code == 200
    datos = r.json()
    assert datos["valor_optimo"] == 50
    assert len(datos["tabla"]) == 3 and len(datos["tabla"][0]) == 11


@pytest.mark.parametrize(
    "cuerpo",
    [
        problema(capacidad=0),
        problema(capacidad=21),
        problema(capacidad="diez"),
        problema(variante="otra"),
        problema(objetos=[]),
        problema(objetos=[{"nombre": "A", "peso": 1, "valor": 1}] * 11),
        problema(objetos=[{"nombre": "A", "peso": 0, "valor": 1}]),
        problema(objetos=[{"nombre": "A", "peso": 2.5, "valor": 1}]),
        problema(objetos=[{"nombre": "A", "peso": 1, "valor": -3}]),
        problema(objetos=[{"nombre": "", "peso": 1, "valor": 1}]),
        problema(variante="acotada"),  # falta la cantidad en cada objeto
        {"variante": "0-1"},  # faltan campos
    ],
)
def test_api_rechaza_datos_invalidos(cuerpo):
    assert client.post("/api/mochila", json=cuerpo).status_code == 422


def test_api_rechaza_cuerpo_que_no_es_json():
    r = client.post("/api/mochila", content="esto no es json", headers={"content-type": "application/json"})
    assert r.status_code == 422


# ---------- Casos extremos encontrados al intentar romper el sistema ----------

def test_api_valor_enorme_no_desborda():
    # 1e308 sumado varias veces daba infinito y un error 500; ahora se rechaza con 422
    cuerpo = problema(variante="no-acotada", capacidad=20, objetos=[{"nombre": "A", "peso": 1, "valor": 1e308}])
    assert client.post("/api/mochila", json=cuerpo).status_code == 422


def test_api_nan_en_el_cuerpo_da_422_y_no_500():
    texto = '{"variante":"0-1","capacidad":5,"objetos":[{"nombre":"A","peso":1,"valor":NaN}]}'
    r = client.post("/api/mochila", content=texto, headers={"content-type": "application/json"})
    assert r.status_code == 422