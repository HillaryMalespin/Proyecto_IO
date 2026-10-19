from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Objeto(BaseModel):
    # Quita espacios al inicio y al final del nombre antes de validar
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=40)
    # strict=True: rechaza "5", 2.5 o true donde se espera un entero
    peso: int = Field(gt=0, strict=True)
    valor: float = Field(gt=0, strict=True, allow_inf_nan=False)
    # Solo se usa en la variante acotada; en las otras puede venir o no
    cantidad: int | None = Field(default=None, gt=0, strict=True)


class ProblemaMochila(BaseModel):
    algoritmo: Literal["mochila"] = "mochila"
    variante: Literal["0-1", "acotada", "no-acotada"]
    capacidad: int = Field(ge=1, le=20, strict=True)
    objetos: list[Objeto] = Field(min_length=1, max_length=10)

    # Regla que depende de dos campos a la vez, por eso va aparte de los Field
    @model_validator(mode="after")
    def exigir_cantidad_si_acotada(self):
        if self.variante == "acotada":
            for o in self.objetos:
                if o.cantidad is None:
                    raise ValueError(f"El objeto '{o.nombre}' necesita una cantidad disponible")
        return self