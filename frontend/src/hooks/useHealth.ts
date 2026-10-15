import { useEffect, useState } from 'react'

export type EstadoServicio = 'verificando' | 'activo' | 'inactivo'

export function useHealth(): EstadoServicio {
  const [estado, setEstado] = useState<EstadoServicio>('verificando')

  useEffect(() => {
    let cancelado = false
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3000)

    fetch('/api/health', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelado && setEstado(d.status === 'ok' ? 'activo' : 'inactivo'))
      .catch(() => !cancelado && setEstado('inactivo'))
      .finally(() => clearTimeout(timer))

    return () => { cancelado = true; ctrl.abort(); clearTimeout(timer) }
  }, [])

  return estado
}