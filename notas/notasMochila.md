## Problema de la Mochila

Resuelve el problema de la mochila por programación dinámica en sus tres variantes
(0/1, acotada y no acotada). El usuario elige la variante e ingresa la capacidad
(entero de 1 a 20) y de 1 a 10 objetos con nombre, peso (entero positivo), valor
(número positivo) y, en la variante acotada, la cantidad disponible. La aplicación
muestra la tabla de programación dinámica, el valor óptimo y los objetos
seleccionados con su cantidad. El algoritmo se ejecuta en el backend
(`POST /api/mochila`, archivo `backend/app/algorithms/mochila.py`) y los datos se
validan tanto en la interfaz como en el servidor. La opción se abre desde el menú
principal, con un tooltip que describe el algoritmo.

### Ejemplos JSON
El problema se puede guardar y volver a cargar desde la interfaz con el siguiente
formato (`cantidad` solo se usa en la variante acotada). Un archivo inválido muestra
un mensaje, nunca un error. Hay archivos de ejemplo en `ejemplos/mochila/`.

```json
{
  "algoritmo": "mochila",
  "variante": "acotada",
  "capacidad": 15,
  "objetos": [
    { "nombre": "Linterna", "peso": 2, "valor": 10, "cantidad": 3 },
    { "nombre": "Agua", "peso": 5, "valor": 18, "cantidad": 2 },
    { "nombre": "Botiquín", "peso": 4, "valor": 15, "cantidad": 1 }
  ]
}
```
Este ejemplo da un valor óptimo de 63 llevando Linterna ×3, Agua ×1 y Botiquín ×1.

### Pruebas
Se ejecutan con `npm test` desde la raíz del repositorio (y en GitHub Actions en cada
push). Las pruebas de la Mochila están en `backend/tests/test_mochila.py` (algoritmo
contra ejercicios resueltos y contra fuerza bruta, y rechazo de datos inválidos) y en
`frontend/src/lib/mochila.test.ts` y `frontend/src/pages/Mochila.test.tsx` (validación
del formulario, carga de archivos y la página completa).

### Declaración de uso de IA (Mochila)
Herramienta: Claude (Anthropic). Tareas: diseño y escritura del algoritmo, la
validación de datos, la página y la tabla del frontend, los estilos, los archivos de
ejemplo, las pruebas automáticas (incluyendo pruebas de casos extremos) y este texto.
Partes del código: `backend/app/algorithms/mochila.py`,
`backend/app/schemas/mochilaValidarArchivo.py`, el endpoint de la Mochila en
`backend/app/main.py`, `frontend/src/lib/mochila.ts`,
`frontend/src/components/TablaMochila.tsx`, `frontend/src/pages/Mochila.tsx`, el bloque
de la Mochila en `frontend/src/styles.css` y los archivos de prueba y de ejemplo
mencionados. El código se trabajó archivo por archivo y fue revisado y probado por el
integrante responsable.