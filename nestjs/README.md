# Task Manager API (PoC)

REST API de un **Sistema de Gestión de Tareas** con autenticación JWT.
Proyecto de prueba de concepto: CRUD completo + auth, PostgreSQL con TypeORM, arquitectura en capas.

## Stack

- **NestJS 11** + TypeScript
- **PostgreSQL 16** (Docker) + **TypeORM** (`synchronize` solo en dev; `data-source.ts` listo para migraciones)
- **JWT** (passport-jwt) + **bcrypt**
- `class-validator` con `ValidationPipe` global estricto (`whitelist`)

## Requisitos

- Node.js 20+
- Docker + Docker Compose (para PostgreSQL)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env   # (ya hay un .env de dev local)

# 3. Levantar PostgreSQL
npm run db:up

# 4. Iniciar la API (modo desarrollo, con auto-reload)
npm run start:dev
```

API disponible en `http://localhost:3000/api`.

Otros comandos:

```bash
npm run build          # Compila a dist/
npm run start:prod     # Corre la build de producción
npm run db:down        # Apaga y detiene Postgres (conserva el volumen)
npm run migration:run  # Aplica migraciones (requiere carpeta src/database/migrations)
```

## Variables de entorno

| Variable | Descripción | Default (dev) |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `NODE_ENV` | Entorno (afecta `synchronize`) | `development` |
| `CORS_ORIGIN` | Orígenes permitidos (coma) | vacío (abierto) |
| `DB_HOST` / `DB_PORT` | Conexión a PostgreSQL | `localhost` / `5432` |
| `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | Credenciales BD | `taskmanager` |
| `JWT_SECRET` | Secreto para firmar tokens | — |
| `JWT_EXPIRES_IN` | Expiración del token | `1h` |

## Endpoints

### Salud
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Estado de API + BD |

### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Crea cuenta; devuelve `{ access_token, user }` |
| POST | `/api/auth/login` | No | Devuelve `{ access_token, user }` |
| GET | `/api/auth/me` | Sí | Perfil del usuario actual |

### Tasks
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/tasks` | Sí | Lista todas las tareas |
| POST | `/api/tasks` | Sí | Crea una tarea |
| GET | `/api/tasks/:id` | Sí | Detalle de una tarea |
| PATCH | `/api/tasks/:id` | Sí | Actualiza `title`, `description`, `status` |
| DELETE | `/api/tasks/:id` | Sí | Elimina una tarea |

### Ejemplos

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"brayan","email":"brayan@example.com","password":"secret123"}'

# Login (devuelve access_token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brayan@example.com","password":"secret123"}'

# Crear tarea (TOKEN = el access_token recibido)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Mi primera tarea","description":"Prueba de la PoC"}'

# Listar tareas
curl http://localhost:3000/api/tasks -H "Authorization: Bearer $TOKEN"

# Completar tarea
curl -X PATCH http://localhost:3000/api/tasks/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"COMPLETED"}'
```

### Modelo de Task

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | autogenerado |
| `title` | string (200) | obligatorio |
| `description` | text | opcional |
| `status` | `PENDING` \| `COMPLETED` | default `PENDING` |
| `createdByUserId` | UUID | FK a `users` (informativo) |
| `createdAt` | timestamp | autogenerado |

### Modelo de User

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | autogenerado |
| `username` | string | único, 3-30, alfanumérico + `_` |
| `email` | string | único |
| `password` | — | hash bcrypt, **nunca** se expone |
| `createdAt` | timestamp | autogenerado |

## Arquitectura

```
src/
├── main.ts                  # Bootstrap: prefijo /api, CORS, ValidationPipe
├── app.module.ts            # Módulo raíz: config, TypeORM, guard y filtro globales
├── app.controller.ts        # GET /health
├── config/
│   ├── env.validation.ts    # Valida variables de entorno al arrancar
│   ├── env-source.ts        # Interfaz para leer env (la cumplen ConfigService y process.env)
│   ├── database.config.ts   # Parámetros de conexión BD — única fuente de verdad
│   └── jwt.config.ts        # Secreto y expiración JWT — única fuente de verdad
├── common/
│   ├── decorators/          # @Public(), @CurrentUser()
│   ├── guards/              # JwtAuthGuard (global)
│   └── filters/             # AllExceptionsFilter (formato de error único)
├── database/data-source.ts  # DataSource para migraciones (TypeORM CLI)
└── modules/
    ├── users/               # Entidad User + service (sin API pública)
    ├── auth/                # register, login, me + estrategia JWT
    └── tasks/               # CRUD de tareas (controller → service → repository)
```

Regla de capas: `controller → service → repository`. Los controllers son delgados, la lógica de negocio vive en los services y las entidades describen el modelo.

## Formato de error

Toda respuesta de error tiene la misma forma:

```json
{
  "statusCode": 404,
  "message": "La tarea 123 no existe",
  "timestamp": "2026-09-23T12:00:00.000Z",
  "path": "/api/tasks/123"
}
```

## Decisión de diseño (PoC) y pendientes para producción

- ⚠️ **Acceso abierto entre usuarios:** cualquier usuario autenticado puede listar, editar y eliminar **cualquier** tarea (no solo las suyas). `createdByUserId` se guarda solo como dato informativo. En producción esto debe restringirse al dueño (proteger contra **IDOR**).
- **Sin paginación:** `GET /api/tasks` devuelve todas. Añadir `page`/`limit` cuando el volumen lo pida.
- **`synchronize: true`** solo en dev. Para producción: migraciones con `npm run migration:generate` / `migration:run`.
- **JWT sin refresh token:** el token expira en 1h; el usuario vuelve a hacer login.
- Subir a GitHub: el `.gitignore` ya excluye `node_modules`, `dist` y `.env`; solo falta `git init` + push (pendiente por diseño, se hace después).
