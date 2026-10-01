/**
 * Falla rápido al arrancar si falta alguna variable de entorno requerida.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter((variable) => !config[variable]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
        'Copia .env.example a .env y completa los valores.',
    );
  }

  return config;
}
