import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDatabaseConfig } from '../config/database.config';
import type { EnvSource } from '../config/env-source';
import { Task } from '../modules/tasks/entities/task.entity';
import { User } from '../modules/users/entities/user.entity';

/**
 * DataSource para la CLI de TypeORM (migraciones).
 *
 * La CLI corre fuera de Nest (no hay ConfigService), así que se adapta
 * `process.env` a la misma interfaz y se reutiliza la MISMA configuración
 * de conexión que la aplicación.
 */
const env: EnvSource = {
  get: (key, defaultValue) => process.env[key] ?? defaultValue,
};

export default new DataSource({
  type: 'postgres',
  ...buildDatabaseConfig(env),
  entities: [User, Task],
  migrations: [
    'src/database/migrations/*.ts',
    'dist/database/migrations/*.js',
  ],
});
