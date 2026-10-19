# Problema de la Mochila (Proyecto 5): notas para el README

## Qué hace
Resuelve el problema de la mochila por programación dinámica en sus tres variantes
(0/1, acotada y no acotada). El usuario elige la variante, ingresa la capacidad C y
los objetos (nombre, peso, valor y, en la acotada, cantidad disponible), y la
aplicación muestra el valor óptimo, los objetos seleccionados (con su cantidad en
las variantes acotada y no acotada) y la tabla de programación dinámica con el
camino de la solución resaltado.

## Reglas de los datos
- Capacidad: entero entre 1 y 20.
- Objetos: de 1 a 10. Nombre obligatorio (máximo 40 caracteres).
- Peso: entero positivo. Valor: número positivo (acepta coma o punto decimal en la interfaz).
- Cantidad: entero positivo, obligatoria solo en la variante acotada.
- La validación ocurre en el frontend (al escribir) y de nuevo en el backend.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `backend/app/algorithms/mochila.py` | Algoritmo de programación dinámica (función pura) |
| `backend/app/schemas/mochilaValidarArchivo.py` | Modelos Pydantic que validan los datos |
| `backend/app/main.py` | Endpoint `POST /api/mochila` |
| `frontend/src/lib/mochila.ts` | Tipos, validación del formulario y lectura de archivos .json |
| `frontend/src/components/TablaMochila.tsx` | Dibuja la tabla DP y resalta el camino |
| `frontend/src/pages/Mochila.tsx` | Página: formulario, guardar/cargar, resultados |
| `ejemplos/mochila/` | Archivos JSON de ejemplo (uno inválido a propósito) |
| `backend/tests/test_mochila.py` | Pruebas del backend |
| `frontend/src/lib/mochila.test.ts`, `frontend/src/pages/Mochila.test.tsx` | Pruebas del frontend |

## El algoritmo
`tabla[i][c]` es el mejor valor usando solo los primeros `i` objetos con capacidad `c`.
La fila 0 y la columna 0 valen 0. Para cada celda se prueban `k` copias del objeto `i`:

`tabla[i][c] = max sobre k de ( tabla[i-1][c - k*peso_i] + k*valor_i )`, con `k*peso_i <= c`.

Lo único que cambia entre variantes es el máximo de copias `k`:
- 0/1: como máximo 1.
- Acotada: la cantidad disponible indicada por el usuario.
- No acotada: `C // peso_i` (todas las que caben).

Una segunda matriz `elegido[i][c]` guarda cuántas copias se usaron en cada celda. Con
ella se reconstruye la solución desde la esquina inferior derecha hacia arriba. En un
empate se prefiere usar menos objetos (comparación estricta).

## API
`POST /api/mochila` recibe:
```json
{ "algoritmo": "mochila", "variante": "acotada", "capacidad": 15,
  "objetos": [ { "nombre": "Linterna", "peso": 2, "valor": 10, "cantidad": 3 } ] }
```
y responde `valor_optimo`, `tabla`, `elegido` y `seleccion` (lista con nombre, peso,
valor y cantidad de lo que se lleva). Datos inválidos devuelven 422 con el detalle.

## Archivos JSON
Mismo formato del cuerpo de la API. `algoritmo` es opcional al cargar; `variante` debe ser
`"0-1"`, `"acotada"` o `"no-acotada"`; `cantidad` solo se usa en la acotada. Un archivo
inválido muestra un mensaje en pantalla, nunca un error.

## Ejemplos y resultados esperados
| Archivo | Capacidad | Valor óptimo | Se lleva |
|---|---|---|---|
| `mochila-0-1.json` | 10 | 90 | Cámara y Agua |
| `mochila-acotada.json` | 15 | 63 | Linterna ×3, Agua ×1, Botiquín ×1 |
| `mochila-no-acotada.json` | 10 | 14 | Manta ×2 |
| `mochila-invalido.json` | 25 | (se rechaza: capacidad mayor a 20) | |

## Pruebas
- Backend (19 de la Mochila, más 1 del health): tabla clásica 0/1, ejemplo del enunciado
  (acotada), no acotada, 150 casos aleatorios contra fuerza bruta, un objeto más pesado que
  la capacidad, la API con un problema válido, y 12 casos de datos inválidos más un cuerpo
  que no es JSON, todos rechazados con 422.
- Frontend (11 de la Mochila, más 5 del menú): 8 de validación del formulario y carga de
  archivos válidos e inválidos, y 3 de la página completa con el backend simulado.

## Decisiones de diseño
- Se exige al menos 1 objeto.
- La no acotada prueba todas las copias posibles en vez de la fórmula `tabla[i][c-peso]`;
  el resultado es el mismo y una sola función sirve para las tres variantes.
- El formulario guarda texto y convierte a número al final, para poder detectar campos
  vacíos y no numéricos.

## Uso de IA (parte de la Mochila)
Se usó Claude (Anthropic) como asistente archivo por archivo: algoritmo, validación,
página y tabla del frontend, estilos, ejemplos, pruebas y estas notas. Cada archivo fue
revisado, probado y pegado por el integrante.