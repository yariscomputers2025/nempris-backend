# Nempris Frontend API Reference

## Base URL

`https://nempris-backend.onrender.com/api`

All requests should be made relative to this base path.

---

## Auth System

### Register

- URL: `POST /api/auth/register`
- Description: Creates a new user account. New users are always created with role `user`.
- Body:
  - `name` (string)
  - `email` (string)
  - `password` (string)

Example request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

Example response:

```json
{
  "message": "Registration successful",
  "user": {
    "id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### Login

- URL: `POST /api/auth/login`
- Description: Authenticates a user and returns a JWT token.
- Body:
  - `email` (string)
  - `password` (string)

Example request body:

```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

Example response:

```json
{
  "message": "Login successful",
  "user": {
    "id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### Token Storage

- Store the JWT token on the frontend after login or registration.
- Recommended storage methods: `localStorage`, `sessionStorage`, or in-memory state with a refresh strategy.
- Example header for protected requests:

```http
Authorization: Bearer <token>
```

---

## Role System

### Roles

- `user`: default role assigned at registration.
- `seller`: can create and manage products, view orders related to their products.
- `admin`: has full control, including managing user roles and removing users.

### Important role rules

- Users can never assign themselves `seller` or `admin` roles during registration.
- Only the admin can promote a `user` to `seller`.
- `admin` is created only through `makeAdmin.js` and cannot be created through the public registration API.

---

## Admin Features

Only admin users can access these endpoints:

### Get all users

- URL: `GET /api/users`
- Description: Retrieve the full user list.
- Auth: required
- Role: `admin`

Example response:

```json
{
  "count": 3,
  "users": [
    {
      "_id": "6423f4c9e4d4bc7c99f2c3b1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z"
    }
  ]
}
```

### Promote user to seller

- URL: `PATCH /api/users/:id/role`
- Description: Update a user's role.
- Auth: required
- Role: `admin`

Request body:

```json
{
  "role": "seller"
}
```

Example response:

```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "seller"
  }
}
```

### Delete a user

- URL: `DELETE /api/users/:id`
- Description: Remove a user account.
- Auth: required
- Role: `admin`

Example response:

```json
{
  "message": "User removed successfully"
}
```

---

## Products API

### Create product

- URL: `POST /api/products`
- Description: Create a product with image uploads.
- Auth: required
- Roles: `seller`, `admin`

Required fields:
- `name`
- `brand`
- `price`
- `description`
- `category`
- `stock`
- `specifications`
- `images` (multipart files)

Example response:

```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "6423f5d4e4d4bc7c99f2c3b2",
    "name": "Test Product",
    "slug": "test-product",
    "brand": "Example Brand",
    "price": 12000,
    "discountPrice": 10000,
    "description": "Test product description",
    "category": "smartphone",
    "stock": 5,
    "images": [
      {
        "url": "https://res.cloudinary.com/.../image.webp",
        "public_id": "nempris/products/..."
      }
    ],
    "specifications": {
      "color": "black",
      "memory": "128GB"
    },
    "createdBy": "6423f4c9e4d4bc7c99f2c3b1"
  }
}
```

### List products

- URL: `GET /api/products`
- Description: Get all products, with search and filter support.
- Auth: not required

### Get product details

- URL: `GET /api/products/:slug`
- Description: Get a single product by slug.
- Auth: not required

### Update product

- URL: `PATCH /api/products/:id`
- Description: Update product fields and optionally replace images.
- Auth: required
- Roles: `seller`, `admin`

Example response:

```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "6423f5d4e4d4bc7c99f2c3b2",
    "name": "Updated Product",
    "price": 11000,
    "stock": 10
  }
}
```

### Delete product

- URL: `DELETE /api/products/:id`
- Description: Remove a product and its Cloudinary images.
- Auth: required
- Roles: `seller`, `admin`

Example response:

```json
{
  "message": "Product removed successfully"
}
```

---

## Orders API

### Create order

- URL: `POST /api/orders`
- Description: Place an order for products from the same seller.
- Auth: required

Request body:

```json
{
  "products": [
    {
      "product": "6423f5d4e4d4bc7c99f2c3b2",
      "quantity": 2
    }
  ],
  "customerName": "John Buyer",
  "phone": "+1234567890"
}
```

Example response:

```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "6423f6e7e4d4bc7c99f2c3b3",
    "products": [
      {
        "product": "6423f5d4e4d4bc7c99f2c3b2",
        "quantity": 2
      }
    ],
    "customerName": "John Buyer",
    "phone": "+1234567890",
    "status": "pending",
    "seller": "6423f4c9e4d4bc7c99f2c3b1"
  }
}
```

### List orders

- URL: `GET /api/orders`
- Description: Get orders based on current user role.
- Auth: required
- Visibility:
  - `admin`: all orders
  - `seller`: orders for their products
  - `user`: orders they created

Example response:

```json
{
  "count": 2,
  "orders": [
    {
      "_id": "6423f6e7e4d4bc7c99f2c3b3",
      "products": [
        {
          "product": {
            "_id": "6423f5d4e4d4bc7c99f2c3b2",
            "name": "Test Product",
            "price": 12000,
            "slug": "test-product"
          },
          "quantity": 2
        }
      ],
      "customerName": "John Buyer",
      "phone": "+1234567890",
      "status": "pending"
    }
  ]
}
```

---

## Image Upload Rules

- Field name: `images`
- Max files: `10`
- Content type: `multipart/form-data`
- Images are stored in Cloudinary

Example form creation in React:

```js
const formData = new FormData();
formData.append('name', 'Test Product');
formData.append('brand', 'Example Brand');
formData.append('price', '12000');
formData.append('description', 'A new phone');
formData.append('category', 'smartphone');
formData.append('stock', '5');
formData.append('specifications', JSON.stringify({ color: 'black', memory: '128GB' }));
images.forEach((file) => {
  formData.append('images', file);
});

fetch('https://nempris-backend.onrender.com/api/products', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});
```

---

## Frontend Flow

### 1. User registers

- Call `POST /api/auth/register`.
- User receives token and role `user`.
- User cannot become `seller` directly.

### 2. Admin logs in

- Admin exists only via `makeAdmin.js`.
- Admin logs in with the hardcoded credentials.

### 3. Admin promotes a user to seller

- Admin calls `PATCH /api/users/:id/role` with `{ "role": "seller" }`.
- Only `admin` may perform this action.

### 4. Seller creates products

- Seller logs in and uses `POST /api/products`.
- Seller can also update and delete their products.

### 5. Users browse and order

- Users can call `GET /api/products` and `GET /api/products/:slug`.
- Users place orders with `POST /api/orders`.
- Orders must contain products from one seller.

---

## Auth Headers

For every protected request include:

```http
Authorization: Bearer <token>
```

Protected routes include product creation/update/delete, order creation, and admin user management.

---

## Error Format

Standard error response structure:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Common status codes:

- `400` bad request
- `401` unauthorized
- `403` forbidden
- `404` not found

---

## Notes for Frontend Developers

- Use `localStorage` or state management to keep the JWT token.
- Do not allow users to select roles on signup.
- Admin-only pages should verify the user role before calling admin endpoints.
- Upload images using `multipart/form-data` and the `images` field.
- Use the base URL `https://nempris-backend.onrender.com/api` for all requests.
