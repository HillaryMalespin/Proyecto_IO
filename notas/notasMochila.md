## Pruebas
```
npm test
```
También se pueden correr por separado con `npm run test:backend` y
`npm run test:frontend`. Las mismas pruebas corren en GitHub Actions en cada push.

## Problema de la Mochila
Resuelve las variantes 0/1, acotada y no acotada por programación dinámica.
El algoritmo está en `backend/app/algorithms/mochila.py` y se expone en
`POST /api/mochila`. La interfaz valida los datos al escribirlos y el backend
los vuelve a validar. Muestra el valor óptimo, los objetos seleccionados (con
cantidad en las variantes acotada y no acotada) y la tabla de programación
dinámica con el camino de la solución resaltado.

Se puede guardar el problema ingresado en un archivo `.json` y volver a cargarlo
para editarlo. Un archivo inválido muestra un mensaje, nunca un error.

## Ejemplos JSON
En `ejemplos/mochila/`: `mochila-0-1.json`, `mochila-acotada.json`,
`mochila-no-acotada.json` y `mochila-invalido.json` (se rechaza a propósito).

Formato (el campo `cantidad` solo se usa en la variante acotada):
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

## Declaración de uso de IA
Herramienta(s): Claude (Anthropic).

Tareas: asistencia en el Proyecto 5 (Mochila): diseño y escritura del algoritmo,
de la validación de datos, de la página y la tabla del frontend, de los estilos,
de los ejemplos JSON y del README. Se trabajó archivo por archivo, y el
integrante revisó, probó y pegó cada parte.

Partes del código: `backend/app/algorithms/mochila.py`,
`backend/app/schemas/mochilaValidarArchivo.py`, el endpoint en
`backend/app/main.py`, `frontend/src/lib/mochila.ts`,
`frontend/src/components/TablaMochila.tsx`, `frontend/src/pages/Mochila.tsx`
y el bloque de la Mochila en `frontend/src/styles.css`.
