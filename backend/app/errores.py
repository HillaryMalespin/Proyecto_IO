"""Mensajes de error claros (en español) para datos inválidos."""

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def _campo(loc: tuple) -> str:
    partes = []
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
    return err.get("msg", "valor inválido")


async def manejar_validacion(_: Request, exc: RequestValidationError) -> JSONResponse:
    errores = [f"{_campo(tuple(e['loc']))}: {_mensaje(e)}" for e in exc.errors()]
    return JSONResponse(status_code=422, content={"errores": errores})


async def manejar_inesperado(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"errores": ["Ocurrió un error inesperado en el servidor."]},
    )
