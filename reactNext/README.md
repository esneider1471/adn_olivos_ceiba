# Task Manager — Web (Dashboard)

Dashboard del Task Manager. Consume la API REST de NestJS (proyecto `../nestjs`)
con Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

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
