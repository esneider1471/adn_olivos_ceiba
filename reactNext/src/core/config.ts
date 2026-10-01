/**
 * Configuración central de la app.
 *
 * `NEXT_PUBLIC_API_URL` se expone al bundle del cliente, así que el navegador
 * la usa directamente. En local apunta a la API de NestJS (puerto 3000,
 * prefijo `/api`); en Docker el contenedor `web` expone la web en 3001 y el
 * navegador sigue hablando a la API en `http://localhost:3000/api`.
 */
export const config = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
} as const;
