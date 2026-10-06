import { expect, test, type Page } from '@playwright/test';

/**
 * Flujo E2E completo de la web contra el stack real local:
 *  - Web:  `next dev` en http://localhost:3001 (la sube Playwright, webServer)
 *  - API:  http://localhost:3000/api (debe estar corriendo antes, p. ej.
 *          `docker compose up -d api` desde la raíz del repo)
 *
 * Cobertura:
 *  1.  Guards: /dashboard sin sesión redirige a /login
 *  2.  Registro → dashboard
 *  3.  Registro duplicado → error
 *  4.  Login con credenciales inválidas → error
 *  5.  Crear tarea
 *  6.  Toggle de estado (PENDING ⇄ COMPLETED)
 *  7.  Editar título y descripción
 *  8.  Eliminar tarea (confirmación de navegador)
 *  9.  Logout limpia la sesión
 *  10. Login + sesión persiste tras recargar
 *  11. Token inválido persistido → redirección a /login y limpieza
 *
 * Nota de aislamiento: cada test de Playwright arranca un contexto de
 * navegador NUEVO (sin localStorage). Los tests que requieren sesión
 * obtienen un token real contra la API (loginViaApi) y lo inyectan con
 * addInitScript antes de navegar, por lo que la suite es autocontenida.
 */

const API_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'task-manager:access_token';

const suffix = Date.now();
const user = {
  username: `e2e_web_${suffix}`,
  email: `e2e.web.${suffix}@test.local`,
  password: 'web-e2e-pass-1',
};

async function loginViaApi(page: Page): Promise<void> {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  // NestJS responde 201 en los POST sin @HttpCode explícito
  expect(res.status()).toBe(201);
  const body = (await res.json()) as { access_token: string };
  await page.addInitScript(
    ([key, token]) => window.localStorage.setItem(key, token),
    [TOKEN_KEY, body.access_token],
  );
}

test.describe.configure({ mode: 'serial' });

test('redirige a /login si no hay sesión (ruta protegida)', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('regista un usuario nuevo y lo lleva al dashboard', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password);
  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(`Hola, ${user.username}`)).toBeVisible();
});

test('muestra error al intentar registrar un email duplicado', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Username').fill(`e2e_dup_${suffix}`);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password);
  await page.getByRole('button', { name: 'Registrarme' }).click();

  await expect(page.getByText('El email ya está registrado')).toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});

test('muestra error de credenciales inválidas en el login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña').fill('clave-inexistente');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Credenciales inválidas')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('crea una tarea y aparece en la lista', async ({ page }) => {
  await loginViaApi(page);
  await page.goto('/dashboard');

  const title = `E2E tarea ${suffix}`;
  await page.getByRole('button', { name: '+ Nueva tarea' }).click();
  await page.getByLabel('Título').fill(title);
  await page.getByLabel('Descripción (opcional)').fill('Creada por la suite E2E');
  await page.getByRole('button', { name: 'Crear tarea' }).click();

  await expect(page.getByRole('listitem').getByText(title)).toBeVisible();
});

test('marca la tarea como completada y vuelve a pendiente', async ({ page }) => {
  await loginViaApi(page);
  await page.goto('/dashboard');

  const title = `E2E tarea ${suffix}`;
  // La lista es global en esta PoC: las acciones se acotan al <li> propio.
  const item = page.getByRole('listitem').filter({ hasText: title });
  const titleEl = item.getByText(title);

  await item.getByRole('button', { name: 'Marcar como completada' }).click();
  await expect(titleEl).toHaveClass(/line-through/);

  await item.getByRole('button', { name: 'Marcar como pendiente' }).click();
  await expect(titleEl).not.toHaveClass(/line-through/);
});

test('edita el título y la descripción de la tarea', async ({ page }) => {
  await loginViaApi(page);
  await page.goto('/dashboard');

  const oldTitle = `E2E tarea ${suffix}`;
  const newTitle = `E2E editada ${suffix}`;
  const item = page.getByRole('listitem').filter({ hasText: oldTitle });

  await item.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Título').fill(newTitle);
  await page.getByLabel('Descripción (opcional)').fill('Descripción actualizada');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page.getByRole('listitem').getByText(newTitle)).toBeVisible();
  await expect(page.getByRole('listitem').getByText(oldTitle)).toHaveCount(0);
});

test('elimina la tarea tras confirmar el diálogo', async ({ page }) => {
  await loginViaApi(page);
  await page.goto('/dashboard');

  page.on('dialog', (dialog) => dialog.accept());

  const title = `E2E editada ${suffix}`;
  const item = page.getByRole('listitem').filter({ hasText: title });
  await item.getByRole('button', { name: 'Eliminar' }).click();

  await expect(page.getByRole('listitem').getByText(title)).toHaveCount(0);
});

test('cierra sesión, vuelve al login y limpia el token', async ({ page }) => {
  await loginViaApi(page);
  await page.goto('/dashboard');

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login/);

  const token = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    TOKEN_KEY,
  );
  expect(token).toBeNull();
});

test('inicia sesión y la sesión persiste tras recargar la página', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(`Hola, ${user.username}`)).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(`Hola, ${user.username}`)).toBeVisible();
});

test('con un token inválido persistido redirige a /login y limpia la sesión', async ({
  page,
}) => {
  await page.addInitScript(
    ([key, token]) => window.localStorage.setItem(key, token),
    [TOKEN_KEY, 'token.invalido.abc'],
  );

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);

  const token = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    TOKEN_KEY,
  );
  expect(token).toBeNull();
});
