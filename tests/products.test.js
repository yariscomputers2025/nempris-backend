const request = require('supertest');
const User = require('../models/User');
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

const createUser = async (role, email) => {
  const password = 'Password1!';
  await request(app)
    .post('/api/auth/register')
    .send({ name: `${role} User`, email, password });

  if (role !== 'user') {
    const user = await User.findOne({ email });
    user.role = role;
    await user.save();
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return loginRes.body.token;
};

describe('Product routes', () => {
  test('Seller can create, retrieve, update, and delete a product', async () => {
    const token = await createUser('seller', 'seller-product@example.com');

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test Product')
      .field('brand', 'TestBrand')
      .field('price', '12000')
      .field('discountPrice', '10000')
      .field('description', 'Test description')
      .field('category', 'smartphone')
      .field('stock', '5')
      .field('specifications', JSON.stringify({ color: 'black', memory: '128GB' }))
      .attach('images', Buffer.from('test'), 'image.png');

    expect(createRes.status).toBe(201);
    expect(createRes.body.product.slug).toBe('test-product');
    expect(createRes.body.product.images[0]).toMatchObject({ url: 'https://example.com/test.webp', public_id: 'mock-id' });

    const listRes = await request(app).get('/api/products');
    expect(listRes.status).toBe(200);
    expect(listRes.body.products.length).toBe(1);
    expect(listRes.body.total).toBe(1);

    const slugRes = await request(app).get(`/api/products/${createRes.body.product.slug}`);
    expect(slugRes.status).toBe(200);
    expect(slugRes.body.name).toBe('Test Product');

    const updateRes = await request(app)
      .patch(`/api/products/${createRes.body.product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('price', '11000')
      .field('stock', '10');

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.product.price).toBe(11000);

    const deleteRes = await request(app)
      .delete(`/api/products/${createRes.body.product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toMatch(/removed/i);
  });

  test('User cannot create products and gets 403', async () => {
    const token = await createUser('user', 'regular-product@example.com');

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Bad Product')
      .field('price', '5000')
      .attach('images', Buffer.from('test'), 'image.png');

    expect(res.status).toBe(403);
  });

  test('Maximum images limit returns error', async () => {
    const token = await createUser('seller', 'seller-maximage@example.com');
    const req = request(app).post('/api/products').set('Authorization', `Bearer ${token}`);

    req.field('name', 'Max Images Product').field('price', '1000');
    for (let i = 0; i < 11; i++) {
      req.attach('images', Buffer.from('test'), `image${i}.png`);
    }

    const res = await req;
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too many files/i);
  });

  test('Search and filter query works', async () => {
    const token = await createUser('seller', 'seller-search@example.com');
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Search Product')
      .field('brand', 'SearchBrand')
      .field('price', '15000')
      .field('stock', '5')
      .field('specifications', JSON.stringify({ size: 'large' }))
      .attach('images', Buffer.from('test'), 'image.png');

    const res = await request(app).get('/api/products?search=Search&brand=SearchBrand&minPrice=10000&maxPrice=16000');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
  });
});
