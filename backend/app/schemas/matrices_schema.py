from typing import Literal

from pydantic import BaseModel, Field, StrictInt, field_validator

# el esquema que ABB espera es:
# { "algoritmo": "multiplicacion-matrices", "dimensiones": [30, 35, 15, 5, 10] }
class ProblemaMatrices(BaseModel):
    # n+1 enteros; 2 <= n <= 10 -> para poder multiplicar algo tiene que ser mayor o igual a 2
    # y la descripcion del problema asume n <= 10
    algoritmo: Literal["multiplicacion-matrices"] = "multiplicacion-matrices"
    dimensiones: list[StrictInt] = Field(min_length=3, max_length=11)

    @field_validator("dimensiones")
    @classmethod
    def positivas(cls, dimensiones):
        for dimension in dimensiones:
            if (dimension <= 0):
                raise ValueError("Las dimensiones deben ser enteros positivos")
        return dimensiones