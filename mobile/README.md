# Task Manager — Mobile

App móvil del Task Manager. Consume la API REST de NestJS (proyecto `../nestjs`)
con **Expo SDK 57** (Expo Router + React Native 0.86) + TypeScript estricto +
React Compiler. Mantiene la misma arquitectura por features que la web (`reactNext/`),
con el mismo diseño (design tokens espejo de la web en `src/shared/theme.ts`).

> Parte del proyecto **Task Manager** (Backend + Web + Mobile). Vuelve al
> [README maestro](../README.md).

## Stack

- **Expo SDK 57**: `expo-router` (routing por archivos), `react-native-web` (misma app en el navegador)
- **React Native 0.86** + **React 19** (React Compiler activado)
- **TypeScript 6** en modo estricto
- **`expo-secure-store`** para persistir el token JWT (Keychain/Keystore nativo)
- UI nativa RN (sin librerías de estilos): tokens de diseño en `src/shared/theme.ts`

## Estructura

```
src/
├─ app/                  # Rutas (Expo Router)
│  ├─ index.tsx          # / → redirige a /dashboard o /login según sesión
│  ├─ (auth)/            # /login, /register (redirigen a /dashboard si ya hay sesión)
│  └─ (app)/             # /dashboard (protegido con <RequireAuth>)
├─ core/                 # Infraestructura sin dominio
│  ├─ config.ts          # EXPO_PUBLIC_API_URL (default http://localhost:3000/api)
│  ├─ http/http.ts       # fetch wrapper: base URL, Bearer, errores, 401 → limpiar sesión
│  └─ auth/token-storage.ts  # token en expo-secure-store (fallback localStorage en web)
├─ features/             # Lógica de negocio por capacidad
│  ├─ auth/               # api, types, AuthContext, LoginForm, RegisterForm, RequireAuth
│  └─ tasks/              # api, types, use-tasks, TaskList, TaskItem, TaskForm
└─ shared/               # UI kit (Button, Input, Card, Alert, Spinner…) + theme + utils
```

Reglas de dependencia: `app` → `features` → `core`; `shared` no depende de nada.

### Sesión y 401

- El token se guarda en **`expo-secure-store`** (Keychain/Keystore). En **web**
  (SecureStore no existe) hay un fallback a `localStorage`.
- Ante un **401** el http client limpia la sesión y notifica al `AuthContext`
  (sincroniza `user = null`); la navegación a `/login` la hace el `<Redirect>`
  declarativo de `RequireAuth` (patrón validado en vivo: 401 en plena sesión →
  login; 401 en el login con clave mala → se queda en `/login` mostrando el error).

## Puesta en marcha

### 1. Levantar la API (puerto 3000)

Desde la raíz del repo:

```bash
docker compose up -d api   # sube db + api
```

o en local sin Docker, ver `../nestjs/README.md`.

### 2. Configurar entorno

```bash
cp .env.example .env   # ya hay un .env de dev local
```

| Variable               | Default                     | Descripción                                    |
| ---------------------- | --------------------------- | ---------------------------------------------- |
| `EXPO_PUBLIC_API_URL`  | `http://localhost:3000/api` | Base URL de la API (se hornea en el bundle)    |

> ⚠️ **Emulador de Android**: `localhost` no apunta al host →
> `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api`.
> **Dispositivo físico**: usa la IP LAN de la máquina (`http://192.168.x.x:3000/api`).

### 3. Correr la app

```bash
npm install
npm run web      # Expo Web en http://localhost:8081 (mismo código, react-native-web)
npm start        # QR para Expo Go o desarrollo (excluye el emulador Android)
```

Para probar en **Expo Go** usa la app en modo web o el simulador iOS:
`expo-secure-store` **no está incluido en Expo Go** (requiere development build),
pero el fallback a `localStorage`/plataforma permite probar el flujo completo en
web y en simuladores.

### Alternativa: todo con Docker

La web está en el compose de la raíz (`docker compose up --build`).
La app móvil no se conteneuriza (es una app nativa); basta con `npm run web`
para probarla contra el stack en Docker (el CORS del compose ya permite `:8081`).

## Comandos

| Comando            | Descripción                                  |
| ------------------ | -------------------------------------------- |
| `npm run web`      | Expo Web (dev) en http://localhost:8081      |
| `npm start`        | Metro + QR (Expo Go / emuladores)            |
| `npm run ios`      | Arranca directo en el simulador iOS          |
| `npm run android`  | Arranca directo en el emulador Android       |
| `npm run lint`     | ESLint (eslint-config-expo)                  |
| `npx tsc --noEmit` | Chequeo de tipos (TS estricto)               |
| `npx expo-doctor`  | Diagnóstico del proyecto                     |
| `npx expo export`  | Build estática (bundles ios + android + web) |

## Verificación

- `npx tsc --noEmit` y `npx eslint . --max-warnings 0` limpios
- `npx expo-doctor` sin fallos
- `npx expo export` genera los bundles de ios, android y web
- Flujo E2E validado: registro → dashboard → crear/toggle/editar/borrar tarea →
  logout; 401 en plena sesión → redirección a login

## Notas

- **`react-native-web` no implementa `Alert.alert`**: las confirmaciones (p. ej.
  eliminar una tarea) usan un `<Modal>` propio en `features/tasks/task-item.tsx`.
- El diseño replica los tokens de la web (mismos hex): `src/shared/theme.ts`.
