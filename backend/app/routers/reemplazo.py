from typing import Annotated, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

from app.algorithms.reemplazo import resolver
from app.errores import RutaConErroresClaros

router = APIRouter(prefix="/api", tags=["reemplazo-equipos"], route_class=RutaConErroresClaros)

# Números reales no negativos y finitos (no se aceptan textos ni booleanos)
Dinero = Annotated[float, Field(strict=True, ge=0, le=1e12, allow_inf_nan=False)]


class Periodo(BaseModel):
    reventa: Dinero
    mantenimiento: Dinero


class SolicitudReemplazo(BaseModel):
    algoritmo: Literal["reemplazo-equipos"] | None = None
    costoInicial: Dinero
    plazo: Annotated[int, Field(strict=True, ge=1, le=30)]
    vidaUtil: Annotated[int, Field(strict=True, ge=1, le=10)]
    periodos: list[Periodo]

    @model_validator(mode="after")
    def periodos_coinciden_con_vida_util(self):
        if len(self.periodos) != self.vidaUtil:
            raise ValueError(
                f"la lista periodos debe tener exactamente {self.vidaUtil} elementos (uno por cada año "
                f"de vida útil), pero tiene {len(self.periodos)}"
            )
        return self


@router.post("/reemplazo-equipos")
def reemplazo_equipos(solicitud: SolicitudReemplazo) -> dict:
    return resolver(
        costo_inicial=solicitud.costoInicial,
        plazo=solicitud.plazo,
        vida_util=solicitud.vidaUtil,
        reventa=[p.reventa for p in solicitud.periodos],
        mantenimiento=[p.mantenimiento for p in solicitud.periodos],
    )
