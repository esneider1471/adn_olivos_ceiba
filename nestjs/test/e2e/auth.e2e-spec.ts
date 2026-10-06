import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * BD de pruebas DEDICADA: no toca la base de desarrollo `taskmanager`.
 * `dotenv` no sobreescribe variables ya presentes en `process.env`,
 * por tanto este valor tiene prioridad sobre el `.env`.
 */
process.env.DB_DATABASE = 'taskmanager_test';

describe('Auth E2E', () => {
  let app: INestApplication;
  let ds: DataSource;

  const suffix = Date.now();
  const user = {
    username: `e2e_auth_${suffix}`,
    email: `e2e.auth.${suffix}@test.local`,
    password: 'sup3r-Secreta!',
  };
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    // Mismas reglas de validación que main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    ds = app.get(DataSource);
    // Limpieza total de la BD de pruebas antes de la suite
    await ds.query('TRUNCATE tasks, users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('responde ok con la base de datos arriba', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);
      expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
    });
  });

  describe('POST /api/auth/register', () => {
    it('crea la cuenta y devuelve access_token + user sin password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(user)
        .expect(201);

      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(0);
      expect(res.body.user).toMatchObject({
        username: user.username,
        email: user.email,
      });
      expect(typeof res.body.user.id).toBe('string');
      expect(res.body.user).not.toHaveProperty('password');

      accessToken = res.body.access_token;
    });

    it('rechaza un email duplicado (409)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...user, username: 'otro_usuario' })
        .expect(409);
      expect(res.body.message).toBe('El email ya está registrado');
    });

    it('rechaza username inválido: muy corto (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: `corto.${suffix}@test.local`,
          password: 'clave-123',
        })
        .expect(400);
    });

    it('rechaza username con caracteres no permitidos (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'usuario-con-espacios',
          email: `espacios.${suffix}@test.local`,
          password: 'clave-123',
        })
        .expect(400);
    });

    it('rechaza email inválido (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: `e2e_bademail_${suffix}`,
          email: 'no-es-un-email',
          password: 'clave-123',
        })
        .expect(400);
    });

    it('rechaza password demasiado corta (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: `e2e_shortpw_${suffix}`,
          email: `shortpw.${suffix}@test.local`,
          password: '12345',
        })
        .expect(400);
    });

    it('rechaza campos no declarados en el DTO (400, forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: `e2e_extra_${suffix}`,
          email: `extra.${suffix}@test.local`,
          password: 'clave-123',
          hacker: 'campo-inesperado',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devuelve access_token con credenciales válidas', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(201);
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rechaza contraseña incorrecta (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: 'clave-incorrecta' })
        .expect(401);
      expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('rechaza email inexistente (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: `fantasma.${suffix}@test.local`, password: 'clave-123' })
        .expect(401);
      expect(res.body.message).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    it('exige token (401 sin Authorization)', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('rechaza token inválido (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token.falso.abc')
        .expect(401);
    });

    it('devuelve el perfil del usuario autenticado, sin password', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toMatchObject({
        username: user.username,
        email: user.email,
      });
      expect(res.body).not.toHaveProperty('password');
    });
  });
});
