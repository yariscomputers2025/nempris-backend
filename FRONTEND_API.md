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
  - `phone` (string)

Example request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
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
    "phone": "+1234567890",
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
    "phone": "+1234567890",
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
- `brand` (ObjectId string)
- `price`
- `description`
- `category` (ObjectId string)
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
    "brand": {
      "_id": "6423f5d4e4d4bc7c99f2c3b3",
      "name": "Apple"
    },
    "price": 12000,
    "discountPrice": 10000,
    "description": "Test product description",
    "category": {
      "_id": "6423f5d4e4d4bc7c99f2c3b4",
      "name": "Smartphone"
    },
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
    "seller": {
      "_id": "6423f4c9e4d4bc7c99f2c3b1",
      "name": "Jane Doe",
      "phone": "+1234567890"
    }
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
    "slug": "updated-product",
    "brand": {
      "_id": "6423f5d4e4d4bc7c99f2c3b3",
      "name": "Apple"
    },
    "price": 11000,
    "discountPrice": 10000,
    "description": "Updated product description",
    "category": {
      "_id": "6423f5d4e4d4bc7c99f2c3b4",
      "name": "Smartphone"
    },
    "stock": 10,
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
    "seller": {
      "_id": "6423f4c9e4d4bc7c99f2c3b1",
      "name": "Jane Doe",
      "phone": "+1234567890"
    }
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

## Seller API

Seller-specific endpoints for managing their own products. Only users with role `seller` can access these.

### Get seller's products

- URL: `GET /api/seller/products`
- Description: Retrieve all products created by the authenticated seller.
- Auth: required
- Role: `seller`

Example response:

```json
{
  "count": 2,
  "products": [
    {
      "_id": "6423f5d4e4d4bc7c99f2c3b2",
      "name": "Test Product",
      "slug": "test-product",
      "brand": {
        "_id": "6423f5d4e4d4bc7c99f2c3b3",
        "name": "Apple"
      },
      "price": 12000,
      "discountPrice": 10000,
      "description": "Test product description",
      "category": {
        "_id": "6423f5d4e4d4bc7c99f2c3b4",
        "name": "Smartphone"
      },
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
      "seller": {
        "_id": "6423f4c9e4d4bc7c99f2c3b1",
        "name": "Jane Doe",
        "phone": "+1234567890"
      }
    }
  ]
}
```

### Update seller's product

- URL: `PATCH /api/seller/products/:id`
- Description: Update a product owned by the authenticated seller.
- Auth: required
- Role: `seller`

Example response:

```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "6423f5d4e4d4bc7c99f2c3b2",
    "name": "Updated Product",
    "slug": "updated-product",
    "brand": {
      "_id": "6423f5d4e4d4bc7c99f2c3b3",
      "name": "Apple"
    },
    "price": 11000,
    "discountPrice": 10000,
    "description": "Updated product description",
    "category": {
      "_id": "6423f5d4e4d4bc7c99f2c3b4",
      "name": "Smartphone"
    },
    "stock": 10,
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
    "seller": {
      "_id": "6423f4c9e4d4bc7c99f2c3b1",
      "name": "Jane Doe",
      "phone": "+1234567890"
    }
  }
}
```

### Delete seller's product

- URL: `DELETE /api/seller/products/:id`
- Description: Remove a product owned by the authenticated seller.
- Auth: required
- Role: `seller`

Example response:

```json
{
  "message": "Product removed successfully"
}
```

---

## Categories API

Admin-only endpoints for managing product categories.

### Create category

- URL: `POST /api/categories`
- Description: Create a new category.
- Auth: required
- Role: `admin`

Request body:

```json
{
  "name": "Smartphone"
}
```

Example response:

```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "6423f5d4e4d4bc7c99f2c3b4",
    "name": "Smartphone",
    "slug": "smartphone"
  }
}
```

### Get all categories

- URL: `GET /api/categories`
- Description: Retrieve all categories.
- Auth: not required

Example response:

```json
{
  "count": 1,
  "categories": [
    {
      "_id": "6423f5d4e4d4bc7c99f2c3b4",
      "name": "Smartphone",
      "slug": "smartphone"
    }
  ]
}
```

### Update category

- URL: `PATCH /api/categories/:id`
- Description: Update a category.
- Auth: required
- Role: `admin`

Request body:

```json
{
  "name": "Updated Smartphone"
}
```

Example response:

```json
{
  "message": "Category updated successfully",
  "category": {
    "_id": "6423f5d4e4d4bc7c99f2c3b4",
    "name": "Updated Smartphone",
    "slug": "updated-smartphone"
  }
}
```

### Delete category

- URL: `DELETE /api/categories/:id`
- Description: Remove a category.
- Auth: required
- Role: `admin`

Example response:

```json
{
  "message": "Category removed successfully"
}
```

---

## Brands API

Admin-only endpoints for managing product brands.

### Create brand

- URL: `POST /api/brands`
- Description: Create a new brand.
- Auth: required
- Role: `admin`

Request body:

```json
{
  "name": "Apple"
}
```

Example response:

```json
{
  "message": "Brand created successfully",
  "brand": {
    "_id": "6423f5d4e4d4bc7c99f2c3b3",
    "name": "Apple",
    "slug": "apple"
  }
}
```

### Get all brands

- URL: `GET /api/brands`
- Description: Retrieve all brands.
- Auth: not required

Example response:

```json
{
  "count": 1,
  "brands": [
    {
      "_id": "6423f5d4e4d4bc7c99f2c3b3",
      "name": "Apple",
      "slug": "apple"
    }
  ]
}
```

### Update brand

- URL: `PATCH /api/brands/:id`
- Description: Update a brand.
- Auth: required
- Role: `admin`

Request body:

```json
{
  "name": "Updated Apple"
}
```

Example response:

```json
{
  "message": "Brand updated successfully",
  "brand": {
    "_id": "6423f5d4e4d4bc7c99f2c3b3",
    "name": "Updated Apple",
    "slug": "updated-apple"
  }
}
```

### Delete brand

- URL: `DELETE /api/brands/:id`
- Description: Remove a brand.
- Auth: required
- Role: `admin`

Example response:

```json
{
  "message": "Brand removed successfully"
}
```

---

## Meta API

### Get meta data

- URL: `GET /api/meta`
- Description: Fetch categories and brands for dropdowns.
- Auth: not required

Example response:

```json
{
  "categories": [
    {
      "_id": "6423f5d4e4d4bc7c99f2c3b4",
      "name": "Smartphone",
      "slug": "smartphone"
    }
  ],
  "brands": [
    {
      "_id": "6423f5d4e4d4bc7c99f2c3b3",
      "name": "Apple",
      "slug": "apple"
    }
  ]
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

- Fetch categories and brands: `GET /api/meta`
- Populate dropdowns with the fetched data
- Seller selects category and brand from dropdowns
- Submit product with selected ObjectIds using `POST /api/products`
- Seller can also update and delete their products using `PATCH /api/seller/products/:id` and `DELETE /api/seller/products/:id`.
- Sellers can view their products using `GET /api/seller/products`.

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
- Product responses include populated `category`, `brand`, and `seller` (with phone) for frontend-ready data.
- Use seller phone for WhatsApp integration: `https://wa.me/${seller.phone}?text=Hello, I'm interested in your product: ${product.name}`.
- Categories and brands are managed by admin only; frontend should fetch them via `GET /api/categories` and `GET /api/brands` for dropdowns.
- Sellers have dedicated endpoints for managing their own products to ensure ownership security.
- Do not allow users to select roles on signup.
- Admin-only pages should verify the user role before calling admin endpoints.
- Upload images using `multipart/form-data` and the `images` field.
- Use the base URL `https://nempris-backend.onrender.com/api` for all requests.
