import type { DatosReemplazo, Resultado } from './reemplazo'

export type RespuestaApi<T> = { ok: true; datos: T } | { ok: false; errores: string[] }

function esResultado(x: unknown): x is Resultado {
  return (
    typeof x === 'object' &&
    x !== null &&
    'costoMinimo' in x &&
    typeof x.costoMinimo === 'number' &&
    'tabla' in x &&
    Array.isArray(x.tabla) &&
    'planes' in x &&
    Array.isArray(x.planes)
  )
}

function extraerErrores(cuerpo: unknown): string[] {
  if (typeof cuerpo === 'object' && cuerpo !== null && 'errores' in cuerpo && Array.isArray(cuerpo.errores)) {
    return cuerpo.errores.filter((e): e is string => typeof e === 'string')
  }
  return []
}

/** Envía el problema al backend. Nunca lanza errores: siempre devuelve un resultado o mensajes. */
export async function resolverReemplazo(
  datos: DatosReemplazo,
  signal?: AbortSignal,
): Promise<RespuestaApi<Resultado>> {
  try {
    const r = await fetch('/api/reemplazo-equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      signal,
    })
    const cuerpo: unknown = await r.json().catch(() => null)
    if (r.ok && esResultado(cuerpo)) return { ok: true, datos: cuerpo }
    const errores = extraerErrores(cuerpo)
    return {
      ok: false,
      errores: errores.length > 0 ? errores : ['El servidor respondió con un error inesperado.'],
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, errores: ['El servidor tardó demasiado en responder. Intente de nuevo.'] }
    }
    return {
      ok: false,
      errores: ['No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.'],
    }
  }
}
