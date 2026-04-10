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

const createSellerProduct = async () => {
  const password = 'Password1!';
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Order Seller', email: 'order-seller@example.com', password });

  const sellerUser = await User.findOne({ email: 'order-seller@example.com' });
  sellerUser.role = 'seller';
  await sellerUser.save();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'order-seller@example.com', password });

  const token = loginRes.body.token;
  const createProductRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Order Product')
    .field('brand', 'OrderBrand')
    .field('price', '20000')
    .field('stock', '10')
    .field('specifications', JSON.stringify({ color: 'black' }))
    .attach('images', Buffer.from('test'), 'image.png');

  return { token, productId: createProductRes.body.product._id };
};

const createUserToken = async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Order Buyer', email: 'order-user@example.com', password: 'Password1!' });
  return registerRes.body.token;
};

describe('Order routes', () => {
  test('User can create and retrieve order', async () => {
    const seller = await createSellerProduct();
    const userToken = await createUserToken();

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ products: [{ product: seller.productId, quantity: 2 }], customerName: 'Buyer QA', phone: '+254700000000' });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.order.status).toBe('pending');
    expect(orderRes.body.order.seller).toBeDefined();
    expect(orderRes.body.order.seller).toMatch(/^[0-9a-fA-F]{24}$/);

    const orderId = orderRes.body.order._id;
    const getRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.customerName).toBe('Buyer QA');
  });

  test('Invalid order id returns 400', async () => {
    const userToken = await createUserToken();
    const res = await request(app)
      .get('/api/orders/invalid-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });

  test('Missing order fields return 400', async () => {
    const userToken = await createUserToken();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ products: [], customerName: '', phone: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/products|customerName|phone/i);
  });
});
