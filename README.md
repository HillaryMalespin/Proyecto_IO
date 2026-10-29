# Proyectos I.O. – Programación Dinámica

Aplicación web con frontend en React + TypeScript y backend en Python + FastAPI.
Un menú principal lanza cada algoritmo; los cálculos se hacen en el backend y se
consumen por API REST.

## Integrantes
- Oscar Andrés Bezara Pérez – 2024075088
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

**Reemplazo de Equipos:** Herramienta(s): ... Tareas: ... Partes del código: ...

**Series Deportivas:** Herramienta(s): ... Tareas: ... Partes del código: ...

**Árboles Binarios de Búsqueda Óptimos:** Herramienta(s): ... Tareas: ... Partes del código: ...

**Multiplicación de Matrices:** Herramienta(s): ... Tareas: ... Partes del código: ...

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