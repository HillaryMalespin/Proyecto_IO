# Proyectos I.O. – Programación Dinámica

Aplicación web con frontend en React + TypeScript y backend en Python + FastAPI.
Un menú principal lanza cada algoritmo; los cálculos se hacen en el backend y se
consumen por API REST.

## Integrantes
- Oscar Andrés Bezara Pérez – 2024075088
- Hillary Malespín Ulloa - 2021106074
- Nombre Apellido – carné
- ...

## Requisitos
- Node.js 22 LTS o superior
- Python 3.12 o superior

## Instalación
```
git clone <url>
cd <repo>

# Entorno virtual del backend
python3 -m venv venv
source venv/bin/activate          # En Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# Dependencias del frontend y comandos del proyecto
npm install
```

## Ejecución del backend
Con el entorno virtual activo, desde la raíz del proyecto:

```
npm run dev:backend
```

También se puede iniciar directamente desde la carpeta `backend`:

```
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs
Health check: http://localhost:8000/api/health

## Ejecución completa
Para iniciar backend y frontend al mismo tiempo:

```
npm run dev
```

Frontend: http://localhost:5173 · Backend: http://localhost:8000

El frontend realiza solicitudes a `/api/*`. Durante el desarrollo, Vite las redirige
al backend mediante el proxy configurado en `frontend/vite.config.ts`.

## Pruebas
```
npm test
```
También se pueden correr por separado con `npm run test:backend` y
`npm run test:frontend`. Las mismas pruebas corren en GitHub Actions en cada push.

## Ejemplos JSON
Cada problema tiene sus archivos de ejemplo en una subcarpeta de `ejemplos/`
(por ejemplo `ejemplos/mochila/`). El formato de cada uno se describe en la sección
de su problema.

---

## Reemplazo de Equipos

Resuelve el problema de reemplazo de equipos por programación dinámica. El usuario
ingresa el costo inicial del equipo, el plazo del proyecto (entero de 1 a 30), la vida
útil del equipo (entero de 1 a 10) y, para cada año de uso, el precio de reventa y el
costo de mantenimiento (números no negativos). La aplicación muestra la tabla de
análisis de cada período, con G(t), las alternativas evaluadas y los instantes de los
siguientes reemplazos, y despliega uno a uno todos los planes óptimos de reemplazo
(hay varios cuando existen empates), con una línea de tiempo y el detalle de cada
equipo. El algoritmo se ejecuta en el backend (`POST /api/reemplazo-equipos`, archivo
`backend/app/algorithms/reemplazo.py`) y los datos se validan tanto en la interfaz como
en el servidor. La opción se abre desde el menú principal, con un tooltip que describe
el algoritmo.

### Cómo funciona
G(t) es el costo mínimo desde el instante t hasta el final del proyecto (n), comprando
un equipo nuevo en t. Se calcula de atrás hacia adelante:

- G(n) = 0
- G(t) = mínimo, para k de 1 a min(vida útil, n − t), de C(t, t+k) + G(t+k)
- C(t, t+k) = costo inicial + mantenimiento acumulado de k años − reventa del año k

La respuesta es G(0). Los siguientes reemplazos de cada instante son todos los
instantes que alcanzan el mínimo; si hay empates, existen varios planes óptimos. El
cálculo usa `Decimal` para que los empates se detecten sin errores de redondeo. Si hay
más de 500 planes óptimos se muestran los primeros 500, pero la cantidad total siempre
se calcula completa.

### Ejemplos JSON de Reemplazo de Equipos
El problema se puede guardar y volver a cargar desde la interfaz con el siguiente
formato. El arreglo `periodos` tiene exactamente `vidaUtil` elementos y el elemento i
corresponde al i-ésimo año de uso del equipo. Un archivo inválido muestra un mensaje,
nunca un error. Hay archivos de ejemplo (válidos y, en `invalidos/`, inválidos) en
`ejemplos/reemplazo-equipos/`.

```json
{
  "algoritmo": "reemplazo-equipos",
  "costoInicial": 500,
  "plazo": 5,
  "vidaUtil": 3,
  "periodos": [
    { "reventa": 400, "mantenimiento": 30 },
    { "reventa": 300, "mantenimiento": 40 },
    { "reventa": 250, "mantenimiento": 60 }
  ]
}
```
Este ejemplo da un costo mínimo de 640 con tres planes óptimos: reemplazar en los
instantes {1, 2}, {1, 4} o {3, 4}.

### Pruebas de Reemplazo de Equipos
Las pruebas están en `backend/tests/test_reemplazo.py` (algoritmo contra ejercicios
resueltos y contra fuerza bruta, empates, decimales, rechazo de datos inválidos y
verificación de los archivos de ejemplo) y en `frontend/src/lib/reemplazo.test.ts` y
`frontend/src/pages/Reemplazo.test.tsx` (validación del formulario, carga de archivos
y la pantalla completa).



## Series Deportivas



## Árboles Binarios de Búsqueda Óptimos



## Multiplicación de Matrices



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

### Ejemplos JSON de la Mochila
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

### Pruebas de la Mochila
Las pruebas de la Mochila están en `backend/tests/test_mochila.py` (algoritmo contra
ejercicios resueltos y contra fuerza bruta, y rechazo de datos inválidos) y en
`frontend/src/lib/mochila.test.ts` y `frontend/src/pages/Mochila.test.tsx`
(validación del formulario, carga de archivos y la página completa).

---

## Declaración de uso de IA

Se usaron herramientas de inteligencia artificial. Cada integrante completa el renglón
de su problema: herramienta, tareas y partes del código.

**Reemplazo de Equipos:** Herramienta(s): Claude (Anthropic). Tareas: La pantalla, la tabla de análisis y el visor de planes del frontend, los estilos y la ayuda para resolver errores de integración (conflictos
de Git, rutas de importación, pruebas del CI, algunos errores del backend). Partes del código:
(Parcialmente cuando presentaba errores me ayudaba a resolver los problemas)`backend/app/algorithms/reemplazo.py`
`backend/app/errores.py`, el registro del router en `backend/app/main.py`, (parte del diseño del frontend)
`frontend/src/lib/reemplazo.ts`, `frontend/src/lib/api.ts`,
`frontend/src/components/PaginaAlgoritmo.tsx`, `frontend/src/components/Campo.tsx`,
`frontend/src/components/reemplazo/`, `frontend/src/pages/Reemplazo.tsx`,
`frontend/src/pagina.css`, la prop `opciones` de `frontend/src/pages/Menu.tsx` y los test y algunos archivos de prueba. El código
se trabajó archivo por archivo y fue revisado y probado por la integrante responsable.

**Series Deportivas:** Herramienta(s): ... Tareas: ... Partes del código: ...

**Árboles Binarios de Búsqueda Óptimos:**

Herramientas:
- GitHub Copilot
Tareas:
- Implementacion de la interfaz grafica de Arboles Binarios para la visualizacion grafica de la estructura del arbol y para representar la misma estetica del resto de la pagina
- Creacion de pruebas automatizadas (npm test)
Partes del código:
- `frontend/src/components/ArbolABB.tsx`
- `frontend/src/components/ArbolABB.test.tsx`
- `frontend/src/components/TablaABB.test.tsx`
- `frontend/src/lib/abb.test.ts`

**Multiplicación de Matrices:** 
- GitHub Copilot
Tareas:
- Implementacion de la interfaz grafica de Multiplicacion de Matrices para representar la misma estetica del resto de la pagina
- Creacion de pruebas automatizadas (npm test)
Partes del código:
- `frontend/src/pages/Matrices.tsx`
- `frontend/src/pages/Matrices.test.tsx`
- `frontend/src/lib/matrices.test.ts`

**Problema de la Mochila:** Herramienta(s): Claude (Anthropic). Tareas: diseño y
escritura del algoritmo, la validación de datos, la página y la tabla del frontend,
los estilos, los archivos de ejemplo, las pruebas automáticas (incluyendo casos
extremos) y la documentación. Partes del código: `backend/app/algorithms/mochila.py`,
`backend/app/schemas/mochilaValidarArchivo.py`, el endpoint de la Mochila y el
manejador de errores de validación en `backend/app/main.py`,
`frontend/src/lib/mochila.ts`, `frontend/src/components/TablaMochila.tsx`,
`frontend/src/pages/Mochila.tsx`, el bloque de la Mochila en `frontend/src/styles.css`
y los archivos de prueba y de ejemplo correspondientes. El código se trabajó archivo
por archivo y fue revisado y probado por el integrante responsable.

Todos los integrantes comprenden el código entregado.
