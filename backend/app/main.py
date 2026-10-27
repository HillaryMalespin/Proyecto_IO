from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.errores import manejar_inesperado, manejar_validacion
from backend.app.algorithms import reemplazo

from app.algorithms.mochila import resolver_mochila
from app.schemas.mochilaValidarArchivo import ProblemaMochila
from app.schemas.abb_schema import ProblemaABB
from app.schemas.seriesDeportivasSchema import SeriesDeportivas
from app.algorithms.ABB import resolver_abb
from app.algorithms.seriesDeportivas import resolverSeriesDeportivas

app = FastAPI(title="Proyectos I.O. - Programación Dinámica")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, manejar_validacion)
app.add_exception_handler(Exception, manejar_inesperado)

app.include_router(reemplazo.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# FastAPI valida el cuerpo contra ProblemaMochila antes de entrar a la funcion.
# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
@app.post("/api/mochila")
def mochila(problema: ProblemaMochila):
    # model_dump() convierte los modelos de Pydantic en dicts normales,
    # que es lo que espera resolver_mochila
    datos = problema.model_dump()
    return resolver_mochila(datos["variante"], datos["capacidad"], datos["objetos"])

# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
@app.post("/api/series-deportivas")
def seriesDeportivas(problema: SeriesDeportivas):
    return resolverSeriesDeportivas(problema.ph, problema.pr, problema.formato)

@app.post("/api/abb-optimo")
# FastAPI recibe el JSON y lo valida contra ProblemaABB antes de entrar a la funcion
# el JSON se convierte en una lista de tuplas, donde cada tupla es (nombre, peso)
# -> ver schemas/abb_schema.py
# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
def abb_optimo(problema: ProblemaABB):
    return resolver_abb([(item.llave, item.peso) for item in problema.llaves])
