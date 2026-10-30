"""Mensajes de error claros (en español) para datos inválidos.

La clase RutaConErroresClaros se aplica SOLO al router del Proyecto 1, así los
endpoints de los otros proyectos conservan el formato de error por defecto.
"""

from collections.abc import Callable

from fastapi import Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute


def _campo(loc: tuple) -> str:
    partes: list[str] = []
    for p in loc:
        if p == "body":
            continue
        if isinstance(p, int):
            if partes:
                partes[-1] = f"{partes[-1]}[{p + 1}]"
        else:
            partes.append(str(p))
    return ".".join(partes) or "datos"


def _mensaje(err: dict) -> str:
    tipo = err.get("type", "")
    ctx = err.get("ctx") or {}
    if tipo == "missing":
        return "es obligatorio"
    if tipo == "greater_than_equal":
        return f"debe ser mayor o igual a {ctx.get('ge')}"
    if tipo == "less_than_equal":
        return f"debe ser menor o igual a {ctx.get('le'):g}"
    if tipo in ("int_type", "int_parsing", "int_from_float"):
        return "debe ser un número entero"
    if tipo in ("float_type", "float_parsing"):
        return "debe ser un número"
    if tipo == "finite_number":
        return "debe ser un número finito"
    if tipo == "list_type":
        return "debe ser una lista"
    if tipo in ("model_attributes_type", "dict_type", "model_type"):
        return "debe ser un objeto"
    if tipo == "literal_error":
        return f"valor no permitido (se esperaba {ctx.get('expected')})"
    if tipo == "json_invalid":
        return "el contenido enviado no es un JSON válido"
    if tipo == "value_error":
        return str(ctx.get("error", err.get("msg", "valor inválido")))
    if tipo == "greater_than":
        return f"debe ser mayor que {ctx.get('gt')}"
    if tipo == "string_too_short":
        return "no puede estar vacío"
    if tipo == "too_short":
        return f"debe tener al menos {ctx.get('min_length')} elemento(s)"
    if tipo == "too_long":
        return f"debe tener como máximo {ctx.get('max_length')} elemento(s)"
    return err.get("msg", "valor inválido")


async def manejar_validacion(_: Request, exc: RequestValidationError) -> JSONResponse:
    errores = [f"{_campo(tuple(e['loc']))}: {_mensaje(e)}" for e in exc.errors()]
    return JSONResponse(status_code=422, content={"errores": errores})


async def manejar_inesperado(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"errores": ["Ocurrió un error inesperado en el servidor."]},
    )


class RutaConErroresClaros(APIRoute):
    """Ruta que responde con {"errores": [...]} en español, sin afectar otras rutas."""

    def get_route_handler(self) -> Callable:
        original = super().get_route_handler()

        async def manejador(request: Request) -> Response:
            try:
                return await original(request)
            except RequestValidationError as exc:
                return await manejar_validacion(request, exc)
            except Exception as exc:  # noqa: BLE001 - nunca mostrar un error crudo
                return await manejar_inesperado(request, exc)

        return manejador
