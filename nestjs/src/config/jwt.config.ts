import { EnvSource } from './env-source';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Configuración de JWT — única fuente de verdad.
 *
 * La comparten `JwtModule` (auth.module.ts) y `JwtStrategy`.
 */
export function buildJwtConfig(env: EnvSource): JwtConfig {
  const secret = env.get('JWT_SECRET');
  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET (revisa tu .env)');
  }

  return {
    secret,
    expiresIn: env.get('JWT_EXPIRES_IN') ?? '1h',
  };
}
