# Task Manager — Web (Dashboard)

Dashboard del Task Manager. Consume la API REST de NestJS (proyecto `../nestjs`)
con Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

> Parte del proyecto **Task Manager** (Backend + Web + Mobile). Vuelve al
> [README maestro](../README.md) para el diagrama de arquitectura y el quick start del stack completo.

## Estructura

```
src/
├─ app/          # Rutas (App Router) + guards de sesión
│  ├─ login/     # /login
│  ├─ register/  # /register
│  └─ dashboard/ # /dashboard (protegido)
├─ core/         # Infraestructura sin dominio
│  ├─ config.ts           # NEXT_PUBLIC_API_URL (default http://localhost:3000/api)
│  ├─ http/http.ts        # fetch wrapper: base URL, Bearer, parseo de errores, 401 -> /login
│  └─ auth/token-storage.ts
├─ features/     # Lógica de negocio por capacidad
│  ├─ auth/       # api, types, AuthContext, LoginForm, RegisterForm
│  └─ tasks/      # api, types, use-tasks, TaskList, TaskItem, TaskForm
└─ shared/       # UI kit (Button, Input, Card, Alert, Spinner, EmptyState) + utils
```

Reglas de dependencia: `app` -> `features` -> `core`; `shared` no depende de nada.

## Desarrollo (en local, sin Docker)

```bash
# 1) base de datos
cd ../nestjs && docker compose up -d

# 2) API (puerto 3000)
cd ../nestjs && npm run start:dev

# 3) web (puerto 3001)
npm run dev -- -p 3001
```

Abre http://localhost:3001.

## Stack completo con Docker

Desde la raíz del repositorio (`../`):

```bash
docker compose up --build
```

- Web: http://localhost:3001
- API: http://localhost:3000/api

La web llama a la API desde el navegador (`http://localhost:3000/api`), por lo que
el contenedor de la API expone el puerto 3000 y acepta CORS de `http://localhost:3001`.
El `JWT_SECRET` se lee del `.env` de la API (no se quema en la imagen).

## Variables de entorno

| Variable                | Default                       | Descripción                          |
| ----------------------- | ----------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`   | `http://localhost:3000/api`   | Base URL de la API (bundle del cliente) |

## Pruebas E2E

Suite **Playwright** (`tests/e2e/`) que recorre el flujo completo contra el
stack real local: guardas de sesión, registro (incl. email duplicado), login
(incl. credenciales inválidas), crear/toggle/editar/borrar tarea, logout,
persistencia de la sesión tras recargar y redirección ante un token inválido.

```bash
# 1) Levantar la API (Playwright levanta la web solo en dev)
docker compose up -d api   # desde la raíz del repo

# 2) Correr las suites
npm run test:e2e            # 11 tests
```

> **Conflicto de puerto 3001:** el contenedor Docker `task-manager-web` ya sirve
> la web en ese puerto. Playwright usa `reuseExistingServer`, así que si el
> contenedor está arriba se reutiliza (recomendado). Si quieres que Playwright
> levante su propio `next dev`, detén el contenedor antes: `docker stop task-manager-web`.

> **Primer uso:** instalar el navegador una sola vez con `npx playwright install chromium`.
