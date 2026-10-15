FROM node:20-slim

# Prisma necesita OpenSSL para conectarse a PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/adopciones/package.json .

RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY shared ./shared
COPY services/adopciones ./services/adopciones

EXPOSE 3005

CMD ["node", "services/adopciones/server.js"]
