import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * BD de pruebas DEDICADA (no toca `taskmanager`).
 * `dotenv` no sobreescribe variables ya presentes en `process.env`.
 */
process.env.DB_DATABASE = 'taskmanager_test';

describe('Tasks E2E', () => {
  let app: INestApplication;
  let ds: DataSource;

  const suffix = Date.now();
  const alice = {
    username: `e2e_alice_${suffix}`,
    email: `e2e.alice.${suffix}@test.local`,
    password: 'alice-pass-1',
  };
  const bob = {
    username: `e2e_bob_${suffix}`,
    email: `e2e.bob.${suffix}@test.local`,
    password: 'bob-pass-1',
  };

  let aliceToken: string;
  let bobToken: string;
  let aliceId: string;
  let basicTaskId: string;
  const UUID_INEXISTENTE = '00000000-0000-4000-8000-000000000000';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    ds = app.get(DataSource);
    await ds.query('TRUNCATE tasks, users RESTART IDENTITY CASCADE');

    const ra = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(alice)
      .expect(201);
    aliceToken = ra.body.access_token;
    aliceId = ra.body.user.id;

    const rb = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(bob)
      .expect(201);
    bobToken = rb.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Protección con JWT', () => {
    it('GET /api/tasks sin token -> 401', async () => {
      await request(app.getHttpServer()).get('/api/tasks').expect(401);
    });

    it('POST /api/tasks sin token -> 401', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'sin token' })
        .expect(401);
    });

    it('DELETE /api/tasks/:id sin token -> 401', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/${UUID_INEXISTENTE}`)
        .expect(401);
    });
  });

  describe('POST /api/tasks', () => {
    it('crea una tarea con valores por defecto (PENDING, sin descripción)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'E2E: tarea básica' })
        .expect(201);

      expect(typeof res.body.id).toBe('string');
      expect(res.body.title).toBe('E2E: tarea básica');
      expect(res.body.status).toBe('PENDING');
      expect(res.body.description).toBeNull();
      expect(res.body.createdByUserId).toBe(aliceId);
      expect(typeof res.body.createdAt).toBe('string');

      basicTaskId = res.body.id;
    });

    it('crea con descripción y estado COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'E2E: tarea completada',
          description: 'Creada directamente como COMPLETED',
          status: 'COMPLETED',
        })
        .expect(201);
      expect(res.body.status).toBe('COMPLETED');
      expect(res.body.description).toBe('Creada directamente como COMPLETED');
    });

    it('rechaza title vacío (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: '' })
        .expect(400);
    });

    it('rechaza status inválido (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'E2E: status malo', status: 'ARCHIVED' })
        .expect(400);
    });

    it('rechaza campos no declarados en el DTO (400, forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'E2E: campo extra', hacker: 'no-debido-pasar' })
        .expect(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('lista las tareas creadas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const titles = res.body.map((t: { title: string }) => t.title);
      expect(titles).toContain('E2E: tarea básica');
      expect(titles).toContain('E2E: tarea completada');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('devuelve el detalle de la tarea', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/tasks/${basicTaskId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);
      expect(res.body.id).toBe(basicTaskId);
      expect(res.body.title).toBe('E2E: tarea básica');
    });

    it('rechaza id que no es UUID (400, ParseUUIDPipe)', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks/no-es-uuid')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(400);
    });

    it('tarea inexistente -> 404', async () => {
      await request(app.getHttpServer())
        .get(`/api/tasks/${UUID_INEXISTENTE}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('cambia el estado a COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${basicTaskId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);
      expect(res.body.status).toBe('COMPLETED');
      // Los demás campos se conservan
      expect(res.body.title).toBe('E2E: tarea básica');
    });

    it('actualiza title y description', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${basicTaskId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'E2E: título actualizado', description: 'nueva descripción' })
        .expect(200);
      expect(res.body.title).toBe('E2E: título actualizado');
      expect(res.body.description).toBe('nueva descripción');
    });

    it('rechaza title vacío (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tasks/${basicTaskId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: '' })
        .expect(400);
    });

    it('tarea inexistente -> 404', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tasks/${UUID_INEXISTENTE}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'COMPLETED' })
        .expect(404);
    });
  });

  describe('Visibilidad entre usuarios (diseño PoC: tareas compartidas)', () => {
    it('Bob ve y puede editar una tarea creada por Alice', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${basicTaskId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ status: 'PENDING' })
        .expect(200);
      expect(res.body.status).toBe('PENDING');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('elimina la tarea y después da 404', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'E2E: para borrar' })
        .expect(201);
      const id = res.body.id;

      await request(app.getHttpServer())
        .delete(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(404);
    });
  });
});
