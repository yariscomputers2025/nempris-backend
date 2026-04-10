# Nempris Backend API Test Examples

Use these sample requests to exercise the backend.

## Base URL

`http://localhost:5000`

## Authentication

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Seller User","email":"seller@example.com","password":"Password1!","role":"seller"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"Password1!"}'
```

## Products

List products:
```bash
curl http://localhost:5000/api/products
```

Search and filter:
```bash
curl "http://localhost:5000/api/products?search=QA&brand=TestBrand&minPrice=10000&maxPrice=12000&page=1&limit=5"
```

Get product by slug:
```bash
curl http://localhost:5000/api/products/qa-product-example
```

Create product (seller/admin):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Product" \
  -F "brand=TestBrand" \
  -F "price=12000" \
  -F "discountPrice=10000" \
  -F "description=Test item" \
  -F "category=smartphone" \
  -F "stock=5" \
  -F "specifications={\"color\":\"black\",\"memory\":\"128GB\"}" \
  -F "images=@/path/to/image1.png"
```

Update product:
```bash
curl -X PATCH http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "price=11000" \
  -F "stock=10"
```

Delete product:
```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Orders

Create order:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"products":[{"product":"PRODUCT_ID","quantity":2}],"customerName":"Buyer Name","phone":"+254700000000"}'
```

List orders:
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get order by ID:
```bash
curl http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Update order status:
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```
