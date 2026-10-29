from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers.reemplazo import router as router_reemplazo

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

# Proyecto 1 (Reemplazo de Equipos): su router está en app/routers/reemplazo.py
# y el algoritmo en app/algorithms/reemplazo.py
app.include_router(router_reemplazo)

# Respuesta 422 sin el campo "input": si el usuario envia NaN o infinito, devolverlo
# en el mensaje de error romperia la serializacion a JSON y daria un error 500
@app.exception_handler(RequestValidationError)
async def errores_de_validacion(request: Request, exc: RequestValidationError):
    detalle = [{"loc": e["loc"], "msg": e["msg"], "type": e["type"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": detalle})


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
#  schemas/abb_schema.py
# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
def abb_optimo(problema: ProblemaABB):
    return resolver_abb([(item.llave, item.peso) for item in problema.llaves])

# FastAPI valida el cuerpo contra ProblemaMatrices antes de entrar a la funcion
# el JSON se convierte en una lista de enteros, que es lo que espera resolver_matrices
# schemas/matrices_schema.py
# Si algo es invalido responde 422 solo, y este codigo nunca se ejecuta.
@app.post("/api/matrices")
def matrices(problema: ProblemaMatrices):
    return resolver_matrices(problema.dimensiones)