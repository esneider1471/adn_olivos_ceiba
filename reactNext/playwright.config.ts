import { defineConfig, devices } from '@playwright/test';

/**
 * E2E de la web contra el stack real local:
 *  - Web:  `next dev` en http://localhost:3001 (webServer, lo levanta Playwright)
 *  - API:  http://localhost:3000/api (fuera de Playwright; debe estar arriba,
 *          p. ej. `docker compose up -d api` desde la raíz del repo)
 *
 * IMPORTANTE: el contenedor Docker `task-manager-web` también ocupa el 3001.
 * Antes de correr `npm run test:e2e`, deténgalo: `docker stop task-manager-web`
 * (y `docker start task-manager-web` al terminar).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
