import type { CSSProperties } from 'react'
import { ubicarArbol, type NodoArbol } from '../lib/abb'

const RADIO = 28
const ESPACIO_ETIQUETA = 28 // espacio bajo los nodos del último nivel para el nombre

interface Props {
  arbol: NodoArbol | null
}

export default function ArbolABB({ arbol }: Props) {
  const { nodos, aristas, ancho, alto } = ubicarArbol(arbol)
  if (nodos.length === 0) return null

  const raiz = nodos.find((n) => n.profundidad === 0)!
  const altoTotal = alto + ESPACIO_ETIQUETA

  return (
    <div className="arbol-scroll">
      <svg
        className="arbol-abb"
        width={ancho}
        height={altoTotal}
        viewBox={`0 0 ${ancho} ${altoTotal}`}
        role="img"
        aria-label={`Árbol binario de búsqueda óptimo con ${nodos.length} llaves. Raíz: ${raiz.nombre}.`}
      >
        {/* Las aristas van primero para quedar debajo de los nodos */}
        {aristas.map((a, i) => (
          <line key={i} className="arbol-arista" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
        ))}

        {nodos.map((n) => (
          <g
            key={n.indice}
            className={n.profundidad === 0 ? 'arbol-grupo arbol-raiz' : 'arbol-grupo'}
            style={{ '--d': n.profundidad } as CSSProperties}
          >
            {/* sombra desplazada, como el box-shadow de las hojas */}
            <circle className="arbol-sombra" cx={n.x + 4} cy={n.y + 4} r={RADIO} />
            <circle className="arbol-nodo" cx={n.x} cy={n.y} r={RADIO} />
            <text className="arbol-indice" x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central">
              K{n.indice}
            </text>
            <text className="arbol-nombre" x={n.x} y={n.y + RADIO + 18} textAnchor="middle">
              {n.nombre}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}