/**
 * Fuente de variables de entorno.
 *
 * `ConfigService` de Nest cumple esta interfaz directamente; la CLI de
 * TypeORM (que corre fuera de Nest) la cumple con un adaptador sobre
 * `process.env`. Así la configuración vive en un solo lugar.
 */
export interface EnvSource {
  get(key: string, defaultValue?: string): string | undefined;
}
