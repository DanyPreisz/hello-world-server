FROM node:22-slim

WORKDIR /usr/src/app

COPY package.json ./
COPY server.js ./
COPY lib ./lib
COPY data ./data
COPY public ./public

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV STORAGE=memory

USER node
EXPOSE 8080

CMD ["node", "server.js"]
