from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.algorithms.mochila import resolver_mochila
from app.schemas.mochilaValidarArchivo import ProblemaMochila

app = FastAPI(title="Proyectos I.O. - Programación Dinámica")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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