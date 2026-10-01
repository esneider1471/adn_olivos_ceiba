import { EnvSource } from './env-source';

/** Parámetros de conexión a la base de datos. */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Configuración de conexión — única fuente de verdad.
 *
 * La comparten:
 *  - la aplicación (`app.module.ts`, vía `ConfigService`), y
 *  - la CLI de TypeORM (`database/data-source.ts`, vía `process.env`).
 *
 * Intencionalmente no depende de TypeORM: solo mapea variables de
 * entorno a parámetros. Quien la consume decide el driver.
 */
export function buildDatabaseConfig(env: EnvSource): DatabaseConfig {
  const host = env.get('DB_HOST');
  const username = env.get('DB_USERNAME');
  const password = env.get('DB_PASSWORD');
  const database = env.get('DB_DATABASE');

  if (!host || !username || !password || !database) {
    throw new Error(
      'Faltan variables de base de datos: DB_HOST, DB_USERNAME, ' +
        'DB_PASSWORD y DB_DATABASE (revisa tu archivo .env)',
    );
  }

  return {
    host,
    port: Number(env.get('DB_PORT', '5432')),
    username,
    password,
    database,
  };
}
