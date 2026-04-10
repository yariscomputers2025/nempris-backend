# Nempris Backend

Node.js + Express backend for an e-commerce system using MongoDB, JWT authentication, and Cloudinary image uploads.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Environment variables are loaded from `.env`.

## Main API endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Products
- `GET /api/products` - list products with search, filter, pagination
- `GET /api/products/:slug` - get product by slug
- `POST /api/products` - create product (seller/admin)
- `PATCH /api/products/:id` - update product (seller/admin)
- `DELETE /api/products/:id` - delete product (seller/admin)

### Orders
- `POST /api/orders` - create order (authenticated user)
- `GET /api/orders` - list orders (admin sees all, seller sees own, user sees own)
- `GET /api/orders/:id` - get order details
- `PATCH /api/orders/:id/status` - update order status (admin/seller)

## Notes
- Image uploads are handled with `multer` memory storage, `sharp` resizing, and Cloudinary storage.
- Requests are validated with `Joi`.
- Role-based access control protects the product and order endpoints.
