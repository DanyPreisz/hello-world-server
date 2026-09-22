# hello-world-server

Servidor HTTP con **JavaScript vanilla** (Node.js, cero dependencias): rutas `/` y `/about`, persistencia en JSON y frontend estático.

## Requisitos

- Node.js 18 o superior

## Cómo correrlo

```bash
git clone https://github.com/DanyPreisz/hello-world-server.git
cd hello-world-server
cp .env.example .env
npm start
```

Abrí [http://localhost:3000](http://localhost:3000) y [http://localhost:3000/about](http://localhost:3000/about).

En desarrollo:

```bash
npm run dev
```

## Rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Home + incrementa visitas en JSON |
| GET | `/about` | About + incrementa visitas en JSON |
| GET | `/api/pages` | Lista las páginas de `data/pages.json` |
| GET | `/api/pages/home` | Contenido de home |
| GET | `/api/pages/about` | Contenido de about |
| GET | `/api/health` | Healthcheck |

## Qué incluye

- Servidor con el módulo nativo `http`
- Base de datos en `data/pages.json`
- Contador de visitas por página
- Frontend en `public/` que consume `/api/pages/:key`
- Escritura atómica del JSON
- Sin Express, Fastify ni otras librerías

## Estructura

```
hello-world-server/
├── data/pages.json
├── lib/db.js
├── lib/http.js
├── public/index.html
├── public/styles.css
├── public/app.js
├── server.js
├── package.json
└── LICENSE
```

## Licencia

MIT
