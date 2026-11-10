# Koti

Plataforma inteligente basada en microservicios para la gestión de refugios de animales y la optimización del proceso de adopción mediante inteligencia artificial.

Trabajo Fin de Grado del Grado en Ingeniería Informática, Escuela Técnica Superior de Ingenierías Informática y de Telecomunicación, Universidad de Granada.

- **Autor:** Manuel Jesús Junquera Lobón
- **Tutores:** Ángel Ruiz Zafra y Janet Pigueiras del Real

## Resumen

Koti es una aplicación web para la gestión integral de un refugio de animales. El personal gestiona desde un panel las fichas de los animales, sus fotografías y su historial médico, revisa las solicitudes de adopción y consulta las estadísticas del refugio. Las personas interesadas pueden consultar los animales disponibles, solicitar su adopción, apadrinarlos o hacer donaciones.

El núcleo del proyecto es un sistema de emparejamiento entre adoptantes y animales con un enfoque híbrido: unas reglas descartan los animales incompatibles con el hogar y calculan una puntuación reproducible, y un modelo de lenguaje valora y explica la compatibilidad del resto. La IA generativa también se usa para interpretar la descripción del hogar escrita en lenguaje natural y para proponer descripciones de los animales, que el personal revisa antes de publicarlas.

## Tecnologías

- **Frontend:** React, Vite, Tailwind CSS, React Router y TanStack Query.
- **Backend:** Node.js y Express, divididos en once microservicios.
- **Base de datos:** PostgreSQL con Prisma.
- **Inteligencia artificial:** Google Gemini (API) u Ollama (modelo local).
- **Despliegue:** Docker y Docker Compose.

## Cómo lanzar el proyecto

Requisitos: Docker con Docker Compose y Node.js 20.

Todos los comandos se ejecutan dentro de la carpeta del proyecto:

       cd refugio-app

1. Crear el archivo de configuración a partir del de ejemplo y rellenar al menos `JWT_SECRET` y, para usar Gemini, `IA_PROVIDER="gemini"` y `GEMINI_API_KEY`:

       cp backend/.env.example backend/.env

   La clave de Gemini se puede obtener gratis en Google AI Studio (https://aistudio.google.com/apikey). Sin ella, la plataforma funciona igual, salvo las funciones de IA: interpretar el texto libre, explicar la compatibilidad y proponer descripciones.

2. Construir y arrancar los contenedores:

       docker compose --profile app up -d --build

   Para usar el modelo local en lugar de Gemini, añadir el perfil `ia` y descargar el modelo:

       docker compose --profile app --profile ia up -d --build
       docker exec refugio-ollama ollama pull llama3.2:3b

3. Crear las tablas de la base de datos:

       cd backend
       npm install
       DATABASE_URL="postgresql://refugio:refugio_dev_password@localhost:5432/refugio_db?schema=public" npx prisma migrate deploy

4. Cargar los datos de ejemplo (opcional; borra los datos que hubiera):

       DATABASE_URL="postgresql://refugio:refugio_dev_password@localhost:5432/refugio_db?schema=public" npm run db:seed

   Cuentas de prueba:

   | Rol | Email | Contraseña |
   |---|---|---|
   | Administrador | admin@refugio.com | admin12345 |
   | Trabajador | voluntario@refugio.com | admin12345 |
   | Adoptante | maria@example.com | password123 |

5. Abrir http://localhost:5173
