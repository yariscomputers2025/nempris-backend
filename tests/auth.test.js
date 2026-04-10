const request = require('supertest');
const { setupTestDB, clearDB, teardownTestDB } = require('./testUtils');

jest.mock('../config/cloudinaryConfig', () => ({
  cloudinary: { uploader: { destroy: jest.fn().mockResolvedValue({}) } },
  uploadBuffer: jest.fn().mockResolvedValue({ secure_url: 'https://example.com/test.webp', public_id: 'mock-id' })
}));

let app;

beforeAll(async () => {
  await setupTestDB();
  app = require('../app');
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Auth routes', () => {
  test('Register creates a new user and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password1!', role: 'seller' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Test User', email: 'test@example.com', role: 'seller' });
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toBeDefined();
  });

  test('Login returns valid token for existing user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'login@example.com', password: 'Password1!', role: 'user' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  test('Invalid login returns 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'badlogin@example.com', password: 'Password1!', role: 'user' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'badlogin@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('Missing register fields returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'missing@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});
