/**
 * Configuración central de la app.
 *
 * `EXPO_PUBLIC_API_URL` se hornea en el bundle del cliente. Por defecto
 * apunta a la API de NestJS (puerto 3000, prefijo `/api`).
 *
 * Nota de red:
 * - Emulador Android: `localhost` NO apunta al host → usar `10.0.2.2`.
 * - Simulador iOS / Expo Web: `localhost` funciona tal cual.
 * - Dispositivo físico: usar la IP LAN de la máquina donde corre la API.
 */
export const config = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
} as const;
