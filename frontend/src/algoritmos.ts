export interface Algoritmo {
  id: string
  nombre: string
  descripcion: string
  ruta: string
  disponible: boolean // pasa a true cuando implementen el proyecto
}

export const algoritmos: Algoritmo[] = [
  { id: 'reemplazo', nombre: 'Reemplazo de Equipos',
    descripcion: 'Determina cuándo conviene reemplazar un equipo para minimizar el costo total en el horizonte de planificación.',
    ruta: '/reemplazo-equipos', disponible: true },
  { id: 'series', nombre: 'Series Deportivas',
    descripcion: 'Calcula la probabilidad de ganar una serie deportiva dadas las probabilidades de victoria en cada juego.',
    ruta: '/series-deportivas', disponible: true },
  { id: 'abb', nombre: 'Árboles Binarios de Búsqueda Óptimos',
    descripcion: 'Construye el árbol de búsqueda que minimiza el costo esperado de búsqueda según las probabilidades de acceso.',
    ruta: '/abb-optimos', disponible: false },
  { id: 'matrices', nombre: 'Multiplicación de Matrices',
    descripcion: 'Encuentra el orden de paréntesis que minimiza el número de multiplicaciones al encadenar matrices.',
    ruta: '/multiplicacion-matrices', disponible: false },
  { id: 'mochila', nombre: 'Problema de la Mochila',
    descripcion: 'Selecciona los objetos que maximizan el valor total sin exceder la capacidad de la mochila.',
    ruta: '/mochila', disponible: true },
]
