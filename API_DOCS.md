# Nempris Backend API Documentation

## Overview

Nempris is a modular e-commerce backend built as a REST API with a clean separation between routing, controllers, validation, middleware, and database models.

- Tech stack: **Node.js**, **Express**, **MongoDB** (via Mongoose), **Cloudinary** image hosting, **JWT** authentication.
- Architecture: Express routes delegate to controllers, validation is handled with Joi, authentication and role-based access control apply via middleware, and file uploads are processed with Multer/Sharp before Cloudinary storage.
- Deployment base URL placeholder: `https://nempris-backend.onrender.com/`

---

## Base URL

`https://nempris-backend.onrender.com/api`

> Use this base URL for all API requests.

---

## Authentication

Authentication is performed with **JSON Web Tokens (JWT)**.

- After login or registration, the server returns a token.
- The token must be sent on protected requests using the header:

```http
Authorization: Bearer <token>
```

### Roles

The system supports three roles:

- `admin`: full access across products and orders.
- `seller`: can create, update, delete their own products, and view/manage orders for their products.
- `user`: can create orders and view their own orders.

Protected routes validate the token and apply role restrictions wherever required.

---

## Endpoints

### Auth

#### Register

- Method: `POST`
- URL: `/api/auth/register`
- Description: Create a new user account and return an auth token.
- Required auth: No

##### Request body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword",
  "role": "seller"
}
```

- `role` is optional; default is `user`.

##### Response example

```json
{
  "message": "Registration successful",
  "user": {
    "id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "seller"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

#### Login

- Method: `POST`
- URL: `/api/auth/login`
- Description: Authenticate a user and return a JWT.
- Required auth: No

##### Request body

```json
{
  "email": "jane@example.com",
  "password": "securePassword"
}
```

##### Response example

```json
{
  "message": "Login successful",
  "user": {
    "id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "seller"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

### Products

#### Create Product

- Method: `POST`
- URL: `/api/products`
- Description: Create a new product with images.
- Required auth: Yes
- Roles: `seller`, `admin`

##### Request body

This endpoint requires `multipart/form-data`.

Fields:
- `name` (string)
- `brand` (string)
- `price` (number)
- `discountPrice` (number)
- `description` (string)
- `category` (string)
- `stock` (number)
- `specifications` (JSON string or parsed object)
- `images` (file[]) max 10

Example using JSON-style values:

```text
name=Test Product
brand=Example Brand
price=12000
discountPrice=10000
description=Test product description
category=smartphone
stock=5
specifications={"color":"black","memory":"128GB"}
```

And upload images in the `images` field.

##### Response example

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
        "url": "https://res.cloudinary.com/.../product.webp",
        "public_id": "nempris/products/..."
      }
    ],
    "specifications": {
      "color": "black",
      "memory": "128GB"
    },
    "createdBy": "6423f4c9e4d4bc7c99f2c3b1",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:00:00.000Z",
    "__v": 0
  }
}
```

---

#### List Products

- Method: `GET`
- URL: `/api/products`
- Description: List products with optional search, filter, and pagination.
- Required auth: No

##### Query parameters

- `search` - text search against name, brand, and description
- `brand` - filter by product brand
- `minPrice` - minimum price filter
- `maxPrice` - maximum price filter
- `page` - pagination page number

##### Response example

```json
{
  "count": 3,
  "total": 12,
  "page": 1,
  "products": [
    {
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
          "url": "https://res.cloudinary.com/.../product.webp",
          "public_id": "nempris/products/..."
        }
      ],
      "specifications": {
        "color": "black",
        "memory": "128GB"
      },
      "createdBy": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "seller"
      },
      "slug": "test-product",
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z"
    }
  ]
}
```

---

#### Get Product by Slug

- Method: `GET`
- URL: `/api/products/:slug`
- Description: Get the details of a single product by its slug.
- Required auth: No

##### Response example

```json
{
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
      "url": "https://res.cloudinary.com/.../product.webp",
      "public_id": "nempris/products/..."
    }
  ],
  "specifications": {
    "color": "black",
    "memory": "128GB"
  },
  "createdBy": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "seller"
  },
  "createdAt": "2026-04-10T10:00:00.000Z",
  "updatedAt": "2026-04-10T10:00:00.000Z"
}
```

---

#### Update Product

- Method: `PATCH`
- URL: `/api/products/:id`
- Description: Update a product fields and optionally replace images.
- Required auth: Yes
- Roles: `seller`, `admin`

##### Request body

Fields may be updated partially.

Example JSON fields when using `multipart/form-data`:

```text
name=Updated Product
price=13000
stock=8
specifications={"color":"white","memory":"256GB"}
```

Include `images` files if replacing image set.

##### Response example

```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "6423f5d4e4d4bc7c99f2c3b2",
    "name": "Updated Product",
    "slug": "updated-product",
    "brand": "Example Brand",
    "price": 13000,
    "discountPrice": 10000,
    "description": "Updated description",
    "category": "smartphone",
    "stock": 8,
    "images": [
      {
        "url": "https://res.cloudinary.com/.../product-updated.webp",
        "public_id": "nempris/products/..."
      }
    ],
    "specifications": {
      "color": "white",
      "memory": "256GB"
    },
    "createdBy": "6423f4c9e4d4bc7c99f2c3b1",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T11:00:00.000Z"
  }
}
```

---

#### Delete Product

- Method: `DELETE`
- URL: `/api/products/:id`
- Description: Delete a product and remove its Cloudinary images.
- Required auth: Yes
- Roles: `seller`, `admin`

##### Response example

```json
{
  "message": "Product removed successfully"
}
```

---

### Orders

#### Create Order

- Method: `POST`
- URL: `/api/orders`
- Description: Create a new order for products from a single seller.
- Required auth: Yes
- Roles: `user`, `seller`, `admin`

##### Request body

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

> All items in the order must belong to the same seller.

##### Response example

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
    "seller": "6423f4c9e4d4bc7c99f2c3b1",
    "createdBy": "6423f4c9e4d4bc7c99f2c3b1",
    "createdAt": "2026-04-10T10:15:00.000Z",
    "updatedAt": "2026-04-10T10:15:00.000Z",
    "__v": 0
  }
}
```

---

#### List Orders

- Method: `GET`
- URL: `/api/orders`
- Description: Retrieve orders visible to the current user.
- Required auth: Yes
- Roles:
  - `admin`: all orders
  - `seller`: orders for their products
  - `user`: orders created by the user

##### Response example

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
      "status": "pending",
      "seller": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdBy": "6423f4c9e4d4bc7c99f2c3b1",
      "createdAt": "2026-04-10T10:15:00.000Z",
      "updatedAt": "2026-04-10T10:15:00.000Z"
    }
  ]
}
```

---

## File Upload

Product image uploads use `multipart/form-data`.

- Field name: `images`
- Max files: `10`
- Each upload is processed with Sharp and stored in Cloudinary.
- If new images are uploaded on update, existing product images are deleted from Cloudinary and replaced.

Example request info:

```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Send text fields and upload files under `images`.

---

## Search & Filter

The product list endpoint supports query parameters.

- `search`: text search across `name`, `brand`, and `description`
- `brand`: exact brand filter
- `minPrice`: number minimum price
- `maxPrice`: number maximum price
- `page`: pagination page number

Example:

```http
GET /api/products?search=phone&brand=Example%20Brand&minPrice=5000&maxPrice=15000&page=2
```

---

## Data Structure

### Product object example

```json
{
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
      "url": "https://res.cloudinary.com/.../product.webp",
      "public_id": "nempris/products/..."
    }
  ],
  "specifications": {
    "color": "black",
    "memory": "128GB"
  },
  "createdBy": {
    "_id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "seller"
  },
  "createdAt": "2026-04-10T10:00:00.000Z",
  "updatedAt": "2026-04-10T10:00:00.000Z"
}
```

### Order object example

```json
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
  "status": "pending",
  "seller": {
    "_id": "6423f4c9e4d4bc7c99f2c3b1",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "createdBy": "6423f4c9e4d4bc7c99f2c3b1",
  "createdAt": "2026-04-10T10:15:00.000Z",
  "updatedAt": "2026-04-10T10:15:00.000Z"
}
```

### User object example

```json
{
  "id": "6423f4c9e4d4bc7c99f2c3b1",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "seller"
}
```

---

## Error Handling

Standard error responses use:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Or if validation returns a message directly, the response will include an HTTP status code and a descriptive message.

Common errors:

- `400 Bad Request`: validation failed, invalid IDs, or unsupported order contents.
- `401 Unauthorized`: missing or invalid token.
- `403 Forbidden`: insufficient role or attempt to modify another user's resource.
- `404 Not Found`: requested product/order does not exist.

---

## Frontend Integration Guide

### Login

1. POST `/api/auth/login` with email and password.
2. Save `token` from the response.
3. Use the token in future protected requests.

### Store token

- Save the token in a secure client-side location such as Redux state, React context, or browser storage.
- For web apps, prefer `localStorage` or `sessionStorage` with CSRF protections.

Example:

```js
localStorage.setItem('nemprisToken', token);
```

### Call protected routes

Include the authorization header on every request that requires auth:

```js
const token = localStorage.getItem('nemprisToken');

fetch('https://nempris-backend.onrender.com/api/products', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});
```

### Upload images

Use `multipart/form-data` for product creation and update.

Example using `FormData`:

```js
const formData = new FormData();
formData.append('name', 'Test Product');
formData.append('brand', 'Example Brand');
formData.append('price', '12000');
formData.append('discountPrice', '10000');
formData.append('description', 'Product description');
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

### Notes for frontend developers

- Use `/api/products` for browsing and filtering products.
- Use `/api/products/:slug` for product detail pages.
- Use `/api/orders` to retrieve orders for the current user or seller.
- Sellers and admins can manage products and order status updates.

---

## Notes

- Product creation requires at least one image.
- Order creation requires products from a single seller.
- Product updates can include optional image replacement; if images are uploaded, the old set is removed and replaced.
