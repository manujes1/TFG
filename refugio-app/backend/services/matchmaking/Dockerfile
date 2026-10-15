FROM node:20-slim

WORKDIR /app

COPY services/matchmaking/package.json .

RUN npm install --omit=dev

COPY shared ./shared
COPY services/matchmaking ./services/matchmaking

EXPOSE 3011

CMD ["node", "services/matchmaking/server.js"]
