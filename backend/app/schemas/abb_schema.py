from pydantic import BaseModel, Field, StringConstraints
from typing import Annotated

# el esquema que ABB espera es:
# lista de:
#     llave, peso

# {
#     "llaves": [
#         {"llave": "Praga", "peso":2023},
#         {"llave": "New York", "peso":8504},
#         {"llave": "San José", "peso":3100},
#         {"llave": "París", "peso":2025},
#         {"llave": "Atenas", "peso":6617}

#     ]
# }

# quitamos espacio al inicio y al final
# tampoco se aceptan llaves vacias
NombreLlave = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class Llave(BaseModel):
    llave: str
    peso: int = Field(ge=0) # validacion -> no valores negativos

class ProblemaABB(BaseModel):
    llaves: list[Llave] = Field(min_length=1) # validacion -> al menos una llave