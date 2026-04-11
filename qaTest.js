const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.resolve(__dirname, 'qaTestOutput.json');

const log = (label, value) => {
  const entry = { label, value };
  console.log(label, JSON.stringify(value, null, 2));
  results.push(entry);
};

const results = [];

const makeRequest = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (error) {
    body = text;
  }
  return { status: res.status, body };
};

const run = async () => {
  const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AArMB9oOJ1nEAAAAASUVORK5CYII=';
  const imageBuffer = Buffer.from(imgBase64, 'base64');
  const randomSuffix = Math.random().toString(16).slice(2);
  const sellerEmail = `seller+${randomSuffix}@example.com`;
  const userEmail = `user+${randomSuffix}@example.com`;

  log('REGISTER_SELLER_START', { email: sellerEmail });
  const regSeller = await makeRequest('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Seller QA', email: sellerEmail, password: 'Password1!', phone: '+254700000001' })
  });
  log('REGISTER_SELLER_RESULT', regSeller);

  log('REGISTER_USER_START', { email: userEmail });
  const regUser = await makeRequest('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Regular QA', email: userEmail, password: 'Password1!', phone: '+254700000002' })
  });
  log('REGISTER_USER_RESULT', regUser);

  const loginSeller = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: sellerEmail, password: 'Password1!' })
  });
  log('LOGIN_SELLER_RESULT', loginSeller);

  const loginUser = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: userEmail, password: 'Password1!' })
  });
  log('LOGIN_USER_RESULT', loginUser);

  const sellerToken = loginSeller.body.token;
  const userToken = loginUser.body.token;

  const form = new FormData();
  form.append('name', `QA Product ${randomSuffix}`);
  form.append('brand', 'TestBrand');
  form.append('price', '12000');
  form.append('discountPrice', '10000');
  form.append('description', 'Test product description');
  form.append('category', 'smartphone');
  form.append('stock', '5');
  form.append('specifications', JSON.stringify({ color: 'black', memory: '128GB' }));
  form.append('images', new Blob([imageBuffer], { type: 'image/png' }), 'test.png');

  const productCreate = await makeRequest('http://localhost:5000/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: form
  });
  log('PRODUCT_CREATE_RESULT', productCreate);

  const productId = productCreate.body?.product?._id;
  const productSlug = productCreate.body?.product?.slug;

  if (productCreate.status === 201 && productId && productSlug) {
    const listResp = await makeRequest('http://localhost:5000/api/products?limit=5&page=1', { method: 'GET' });
    log('PRODUCT_LIST_RESULT', listResp);

    const searchResp = await makeRequest(
      `http://localhost:5000/api/products?search=QA&brand=TestBrand&minPrice=10000&maxPrice=12000&limit=5&page=1`,
      { method: 'GET' }
    );
    log('PRODUCT_SEARCH_FILTER_RESULT', searchResp);

    const slugResp = await makeRequest(`http://localhost:5000/api/products/${productSlug}`, { method: 'GET' });
    log('PRODUCT_BY_SLUG_RESULT', slugResp);

    const form2 = new FormData();
    form2.append('price', '11000');
    form2.append('stock', '10');
    form2.append('description', 'Updated description');

    const updateResp = await makeRequest(`http://localhost:5000/api/products/${productId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: form2
    });
    log('PRODUCT_UPDATE_RESULT', updateResp);

    const orderResp = await makeRequest('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ products: [{ product: productId, quantity: 2 }], customerName: 'Buyer QA', phone: '+254700000000' })
    });
    log('ORDER_CREATE_RESULT', orderResp);

    const orderId = orderResp.body?.order?._id;
    if (orderResp.status === 201 && orderId) {
      const orderDetails = await makeRequest(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${userToken}` }
      });
      log('ORDER_DETAILS_RESULT', orderDetails);
    }

    const invalidOrderResp = await makeRequest('http://localhost:5000/api/orders/invalid-id', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    log('ORDER_INVALID_ID_RESULT', invalidOrderResp);

    const missingOrderResp = await makeRequest('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ products: [], customerName: '', phone: '' })
    });
    log('ORDER_MISSING_FIELDS_RESULT', missingOrderResp);

    const imageOverLimit = new FormData();
    for (let i = 0; i < 11; i++) {
      imageOverLimit.append('images', new Blob([imageBuffer], { type: 'image/png' }), `img${i}.png`);
    }
    imageOverLimit.append('name', 'Too Many Images');
    imageOverLimit.append('brand', 'TestBrand');
    imageOverLimit.append('price', '1000');
    imageOverLimit.append('stock', '1');

    const overLimitResp = await makeRequest('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: imageOverLimit
    });
    log('PRODUCT_CREATE_OVER_IMAGE_LIMIT', overLimitResp);

    const deleteResp = await makeRequest(`http://localhost:5000/api/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    log('PRODUCT_DELETE_RESULT', deleteResp);
  }

  const form3 = new FormData();
  form3.append('name', 'Forbidden Product');
  form3.append('price', '5000');
  form3.append('images', new Blob([imageBuffer], { type: 'image/png' }), 'test.png');

  const badProduct = await makeRequest('http://localhost:5000/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: form3
  });
  log('USER_CREATE_PRODUCT_FORBIDDEN', badProduct);

  const invalidLogin = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: sellerEmail, password: 'WrongPassword' })
  });
  log('INVALID_LOGIN_RESULT', invalidLogin);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
};

run().catch((error) => {
  console.error('QA SCRIPT ERROR', error);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
});
