# Refugio App

Plataforma web para la gestión integral de un refugio de animales. TFG de Ingeniería Informática.

## Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL 16
- IA: proveedor intercambiable por `IA_PROVIDER` — Ollama (local, `llama3.2:3b` por defecto) o Gemini (API de Google)

## Requisitos
- Node.js 20+
- Docker y Docker Compose
- PostgreSQL (local o vía Docker)

## Arranque rápido
# Empezar a trabajar
cd ~/proyectos/refugio-app
docker compose up -d
cd backend && npm run dev

# Acabar de trabajar
# Ctrl+C en el terminal del backend
docker compose down       # desde la raíz del proyecto

## IA

El proveedor se elige en `backend/.env` con `IA_PROVIDER` (`ollama` por defecto o `gemini`). Ambos comparten la misma interfaz (`backend/src/config/ia/`), de modo que el resto del código no depende de ninguno.

- **Ollama** (local, sin que los datos salgan de la máquina): `docker compose --profile ia up -d` y descargar el modelo indicado en `OLLAMA_MODEL`.
- **Gemini**: definir `GEMINI_API_KEY` (y opcionalmente `GEMINI_MODEL`). Con este proveedor, el texto de preferencias y los datos del animal se envían a un servicio externo.

La puntuación de compatibilidad la calcula siempre el algoritmo determinista (`backend/src/utils/compatibilidad.js`); el LLM solo redacta textos y traduce texto libre a un perfil estructurado.

### Evaluación del emparejamiento

`backend/scripts/evaluar-matchmaking.js` compara la puntuación del algoritmo con la que asigna un LLM a los mismos pares (dataset en `backend/scripts/datos/`) y genera un CSV y un resumen en `backend/scripts/resultados/`:

    cd backend
    node scripts/evaluar-matchmaking.js --provider gemini --repeticiones 3 --pares 30
    node scripts/evaluar-matchmaking.js --provider ollama --repeticiones 3 --pares 30
