from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

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

# quitamos espacio al inicio y al final y tampoco se aceptan llaves vacias
NombreLlave = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class Llave(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    llave: NombreLlave
    peso: int = Field(gt=0, strict=True)

class ProblemaABB(BaseModel):
    algoritmo: Literal["abb-optimo"] = "abb-optimo"
    llaves: list[Llave] = Field(min_length=1)

    @field_validator("llaves")
    @classmethod
    def llaves_unicas(cls, llaves):
        nombres = [item.llave for item in llaves]
        if len(nombres) != len(set(nombres)):
            raise ValueError("Las llaves deben ser unicas")
        return llaves