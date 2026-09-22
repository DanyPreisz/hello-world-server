# hello-world-server

Servidor HTTP con **JavaScript vanilla** (Node.js, cero dependencias): rutas `/` y `/about`, persistencia en memoria o GCS, y frontend estático. Listo para Cloud Run.

## Requisitos

- Node.js 18 o superior

## Cómo correrlo en local

```bash
git clone https://github.com/DanyPreisz/hello-world-server.git
cd hello-world-server
cp .env.example .env
npm start
```

Abrí [http://localhost:8080](http://localhost:8080) y [http://localhost:8080/about](http://localhost:8080/about).

En desarrollo:

```bash
npm run dev
```

`STORAGE=memory` es el default. El seed sale de `data/pages.json`; las visitas viven en RAM y se pierden al reiniciar.

## Persistencia

| `STORAGE` | Comportamiento |
| --- | --- |
| `memory` | En memoria. Sirve para local y para un demo en Cloud Run. |
| `gcs` | Lee y escribe `pages.json` en un bucket. Sirve para compartir estado entre instancias. |

Para GCS hace falta:

- `GCS_BUCKET`
- opcional `GCS_OBJECT` (default `pages.json`)
- en Cloud Run, la service account del servicio con `roles/storage.objectAdmin` sobre el bucket
- en local, opcional `GCS_ACCESS_TOKEN` si querés probar sin metadata server

## Rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Home + incrementa visitas |
| GET | `/about` | About + incrementa visitas |
| GET | `/api/pages` | Lista las páginas |
| GET | `/api/pages/home` | Contenido de home |
| GET | `/api/pages/about` | Contenido de about |
| GET | `/api/health` | Healthcheck + storage activo |

## Deploy a Cloud Run

Hace falta un proyecto de GCP con billing y estas APIs: Cloud Run, Cloud Build, Artifact Registry.

Memoria (más simple):

```bash
gcloud run deploy hello-world-server \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars STORAGE=memory
```

GCS:

```bash
gcloud storage buckets create gs://TU_BUCKET --location=southamerica-east1

gcloud run deploy hello-world-server \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars STORAGE=gcs,GCS_BUCKET=TU_BUCKET
```

Después dale al service account de Cloud Run permiso sobre el bucket:

```bash
gcloud storage buckets add-iam-policy-binding gs://TU_BUCKET \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectAdmin"
```

También se puede buildear la imagen local:

```bash
docker build -t hello-world-server .
docker run --rm -p 8080:8080 hello-world-server
```

## Estructura

```
hello-world-server/
├── Dockerfile
├── .dockerignore
├── data/pages.json
├── lib/db.js
├── lib/memory-store.js
├── lib/gcs-store.js
├── public/
└── server.js
```

## Licencia

MIT
