# Proyectos I.O. – Programación Dinámica

## Integrantes
- Nombre Apellido – carné
- ...

## Requisitos
- Node.js 22 LTS o superior
- Python 3.12 o superior

## Instalación
git clone <url>
cd <repo>

# Entorno virtual del backend
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Dependencias del frontend y comandos del proyecto
npm install

## Ejecución del backend
Con el entorno virtual activo, desde la raíz del proyecto:

npm run dev:backend

También se puede iniciar directamente desde la carpeta `backend`:

cd backend
python -m uvicorn app.main:app --reload --port 8000

API: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs
Health check: http://localhost:8000/api/health

## Ejecución completa
Para iniciar backend y frontend al mismo tiempo:

npm run dev

Frontend: http://localhost:5173 · Backend: http://localhost:8000

El frontend realiza solicitudes a `/api/*`. Durante el desarrollo, Vite las redirige al backend mediante el proxy configurado en `frontend/vite.config.ts`.

## Pruebas
npm test   (o npm run test:backend / npm run test:frontend)

## Ejemplos JSON
Ver carpeta `ejemplos/` (ejemplo: ejemplos/mochila.json)

## Declaración de uso de IA
Herramienta(s): ...
Tareas: ...
Partes del código: ...
Todos los integrantes comprenden el código entregado.