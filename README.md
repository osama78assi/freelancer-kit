# Freelancer Price Analyzer (Tracking Jobs Kit)

A personal kit to track freelance job listings you find on freelancing platforms and analyze them, so you can decide the **best price** that fits you before offering any service.

You simply log every service you spot (title, price, currency and its description), optionally attach **additional services** that are sold on top of the main one, and let the statistics engine tell you what the market really looks like for each service.

## Feature Overview

### 1. Services Dashboard — Add & track services

![Services dashboard](pics/dashboard.png)

- **Add a service** with its title, description, price and currency (all ISO-4217 currencies are supported).
- For every main service you can **attach additional services** (extra fees, rush delivery, revisions, etc.) exactly like sellers do on the marketplace.
- **List** all your recorded services and quickly search them **by service title**.
- **Check** each entry, edit it, or delete it — everything updates in real time.

### 2. Statistics & Dashboard — Search by service title

![Statistics](pics/stat.png)

![Statistics table](pics/statTable.png)

- Every search in the statistics section works **by service title**.
- The dashboard shows the **best 10 services** ranked by average and max price, together with the **min price** of each service.
- Statistics are computed for **all services**, **grouped by lowercased service title**, so titles that differ only by capitalization (`Logo Design` / `logo design` / `LOGO DESIGN`) are treated as the same service.
- **Additional services are excluded from the statistics** — only the price of the main service counts.
- That helps you identify which service you want to prepare yourself to provide and specify a very well-informed price for it.

> Any new service you add is reflected in the statistics right away — the tool stays up to date with your data at all times.

## Tech Stack

| Part       | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite + Ant Design + Recharts + TailwindCSS |
| Backend    | Node.js + Express 5 + TypeScript                                   |
| Database   | **PostgreSQL** (via Prisma ORM + `pg` driver adapter)              |
| Auth/other | — (fully open source, self-hosted)                                 |

## Project Structure

```
trackJobs/
├── backend/          # Express API + serves the built frontend
│   ├── .env.example  # Copy this to .env
│   ├── modules/      # API controllers, services & static frontend
│   └── prisma/       # Database schema & migrations
├── frontend/         # React + Vite application
└── pics/             # Screenshots used in this README
```

## Getting Started

### Requirements

- Node.js (modern LTS)
- **PostgreSQL** running locally or remotely (or change the database target in `backend/prisma/schema.prisma`)

### 1. Configuration (`dotenv`)

Copy the example environment file and fill in your values:

```bash
cd backend
cp .env.example .env
```

The backend loads the environment file from `backend/.env` on start. A full example:

```dotenv
# CORS allowed origins (comma separated, no spaces)
CROS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:49155

# Host & port the server listens on
HOST_NAME=localhost
PORT=49155

# DEVELOPMENT or PRODUCTION
# IMPORTANT: set to PRODUCTION when running in production.
# It decides which database URL is used:
NODE_ENV=DEVELOPMENT

# Development database
DATABASE_URL_DEV="postgresql://postgres:change_me@localhost:5432/freelancing_test?schema=public"

# Production database
DATABASE_URL="postgresql://postgres:change_me@localhost:5432/freelancing?schema=public"
```

> **`NODE_ENV` is important.** The backend uses it to choose the database:
> `NODE_ENV=DEVELOPMENT` → `DATABASE_URL_DEV`, `NODE_ENV=PRODUCTION` → `DATABASE_URL`.
> When running this in production as-is, you **must** set `NODE_ENV=production` in your environment, and you **must** have a running **PostgreSQL** instance (or change the target database in `backend/prisma/schema.prisma`).

### 2. Prepare the database

```bash
cd backend
npm install
npm run gen-types        # generate the Prisma client
npx prisma migrate deploy   # apply the migrations to your database
```

### 3. Start the application

The frontend was already built into static files and moved together with the templates into `backend/modules/root/static`. So **if you don't want to touch the frontend code**, just serve it from the backend:

```bash
cd backend
npm run build            # compiles TS, copies statics/templates & installs deps into dist/
cd dist
npm run runProd          # node ./index.js
```

Then open your browser at the configured port (default `49155`):

```
http://localhost:49155
```

#### If you want to update the frontend code

Build the frontend and move the new output into the backend's static folder:

```bash
cd frontend
npm install
npm run build            # outputs to frontend/dist

# Copy the new build into the backend static folder (overwrites the old files)
# e.g. on Windows: copy dist\* ..\backend\modules\root\static\
```

Then follow the "Start the application" steps above and `npm run build` in the backend again so the latest assets are packaged into `dist/`. In case you have updated the HTML file then replace that with the one that is exist in `templates` folder

### Running in production

- Set `NODE_ENV=production` (so `DATABASE_URL` is used).
- Set `DATABASE_URL` to your production PostgreSQL connection string.
- Make sure `CROS_ALLOWED_ORIGINS` contains the exact origin(s) your app is served from.
- Run `npm run build` in `backend`, then `cd dist && npm run runProd`.

## Development

```bash
# Frontend dev server (defaults to port 5173 via Vite)
cd frontend
npm run dev

# Backend dev server with auto-reload
cd backend
npm run dev
```

The frontend API client points to `http://localhost:49155/api/v1` (`frontend/src/api/base.ts`) — adjust it if you change the backend port.

## API

The REST API is served under `/api/v1` and covers creating, listing, updating and deleting freelance services, plus:

| Endpoint                        | Description                                                        |
| ------------------------------- | ------------------------------------------------------------------ |
| `GET /api/v1/services`          | List services, searchable by title via `q`                          |
| `POST /api/v1/services`         | Create a service (pass `parentServiceId` for an additional service) |
| `PATCH /api/v1/services/:id`    | Update a service                                                    |
| `DELETE /api/v1/services/:id`   | Delete a service                                                    |
| `GET /api/v1/services/statistics`                  | Statistics for all services (grouped by lowercased title) |
| `GET /api/v1/services/statistics/best`             | Best 10 services by avg/max price with min price          |
| `GET /api/v1/services/statistics/:title`           | Statistics for a specific service title                    |

## License

MIT — fully open source. See [LICENSE](LICENSE).
