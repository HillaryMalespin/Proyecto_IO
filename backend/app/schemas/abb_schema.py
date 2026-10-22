from pydantic import BaseModel

# el esquema que ABB espera es:
# (numero de nodos, lista de probabilidades, lista de llaves)
class ProblemaABB(BaseModel):
    nodes: int
    probabilities: list[float]
    keys: list[int]