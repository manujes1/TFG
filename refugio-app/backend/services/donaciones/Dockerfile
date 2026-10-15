FROM node:20-slim

# Prisma necesita OpenSSL para conectarse a PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/donaciones/package.json .

RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY shared ./shared
COPY services/donaciones ./services/donaciones

EXPOSE 3007

CMD ["node", "services/donaciones/server.js"]
