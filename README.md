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
- `POST /api/auth/register` - Register with name, email, password, phone
- `POST /api/auth/login` - Login and receive JWT token

### Products
- `GET /api/products` - List products with search, filter, pagination (populated category, brand, seller with phone)
- `GET /api/products/:slug` - Get product by slug (populated data)
- `POST /api/products` - Create product (seller/admin)
- `PATCH /api/products/:id` - Update product (seller/admin)
- `DELETE /api/products/:id` - Delete product (seller/admin)

### Seller Products
- `GET /api/seller/products` - Get products owned by seller
- `PATCH /api/seller/products/:id` - Update own product
- `DELETE /api/seller/products/:id` - Delete own product

### Categories (Admin only)
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Brands (Admin only)
- `GET /api/brands` - List all brands
- `POST /api/brands` - Create brand
- `PATCH /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Orders
- `POST /api/orders` - Create order (authenticated user)
- `GET /api/orders` - List orders (admin sees all, seller sees own, user sees own)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (admin/seller)

### Meta
- `GET /api/meta` - Get categories and brands for dropdowns

### Admin Users
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Promote user to seller
- `DELETE /api/users/:id` - Delete user

## Notes
- Image uploads are handled with `multer` memory storage, `sharp` resizing, and Cloudinary storage.
- Requests are validated with `Joi` (including phone number format and ObjectId validation for categories/brands).
- Role-based access control protects the product and order endpoints.
- Product responses include populated `category`, `brand`, and `seller` (with phone) for frontend-ready data.
- Sellers can only manage their own products; admins manage categories and brands.
- User phone numbers are required for registration and used for WhatsApp order integration.
