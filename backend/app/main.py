from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.errores import manejar_inesperado, manejar_validacion

# TODO : cambiar "algoritmos" por "algorithms" en todos los imports de reemplazo temporalmente
# es que si no el backend no compila, toca resolver este problema
# por ahora lo dejo asi para poder avanzar con lo de matrices y abb (gui)
try:
    from app.algorithms import reemplazo
except ImportError:
    reemplazo = None

from app.algorithms.mochila import resolver_mochila
from app.schemas.mochilaValidarArchivo import ProblemaMochila
from app.schemas.abb_schema import ProblemaABB
from app.schemas.seriesDeportivasSchema import SeriesDeportivas
from app.schemas.matrices_schema import ProblemaMatrices
from app.algorithms.ABB import resolver_abb
from app.algorithms.seriesDeportivas import resolverSeriesDeportivas
from app.algorithms.matrices import resolver_matrices

app = FastAPI(title="Proyectos I.O. - Programación Dinámica")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, manejar_validacion)
app.add_exception_handler(Exception, manejar_inesperado)

# TODO : cambiar "algoritmos" por "algorithms" en todos los imports de reemplazo temporalmente
if reemplazo is not None:
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

# FastAPI valida el cuerpo contra ProblemaMatrices antes de entrar a la funcion
# el JSON se convierte en una lista de enteros, que es lo que espera resolver_matrices
# -> ver schemas/matrices_schema.py
# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
@app.post("/api/matrices")
def matrices(problema: ProblemaMatrices):
    return resolver_matrices(problema.dimensiones)