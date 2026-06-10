# Manual Verification Guide

This document provides step-by-step instructions for manually testing all API endpoints using curl commands. Follow the sequence to test the complete happy path and edge cases.

## Prerequisites

1. Start the server: `npm run dev`
2. Server should be running on `http://localhost:3000`
3. For Windows CMD, use these curl commands as-is
4. For PowerShell, replace single quotes with double quotes and escape inner quotes

## Environment Variables

Save these to `.env` file:
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
JWT_SECRET=test_secret_key_for_development
USE_SUPABASE=false
```

---

## 1. Health Check & System Endpoints

### Check Server Health
```bash
curl http://localhost:3000/health
```

**Expected:** `200 OK` with status, timestamp, and uptime

### Check API Version
```bash
curl http://localhost:3000/api/version
```

**Expected:** `200 OK` with version 1.0.0

### Check Welcome Message
```bash
curl http://localhost:3000/
```

**Expected:** `200 OK` with welcome message

---

## 2. Authentication Flow

### Register User 1 (Customer)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"customer@example.com\",\"password\":\"Customer123\",\"name\":\"John Customer\"}"
```

**Expected:** `201 Created` with user object and JWT token

**Save the token as** `CUSTOMER_TOKEN`

### Register User 2 (Will be Admin)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123!\",\"name\":\"Admin User\"}"
```

**Expected:** `201 Created` with user object and JWT token

**Save the token as** `ADMIN_TOKEN` and **user ID as** `ADMIN_USER_ID`

**Note:** To make this user an admin, you need to manually update the user role in the database or add the user ID to `ADMIN_USER_IDS` in `.env`:
```bash
ADMIN_USER_IDS=<ADMIN_USER_ID>
```
Then restart the server.

### Login as Customer
```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"customer@example.com\",\"password\":\"Customer123\"}"
```

**Expected:** `200 OK` with user object and JWT token

### Login with Wrong Password (Edge Case)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"customer@example.com\",\"password\":\"WrongPassword\"}"
```

**Expected:** `401 Unauthorized` with error message

### Get Current User Profile
```bash
curl -X GET http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected:** `200 OK` with user profile (no password field)

### Verify Token
```bash
curl -X GET http://localhost:3000/api/v1/auth/verify -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected:** `200 OK` with token validation status

### Access Protected Route Without Token (Edge Case)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me
```

**Expected:** `401 Unauthorized`

---

## 3. Products Catalog

### Get All Products (Public Access)
```bash
curl http://localhost:3000/api/v1/products
```

**Expected:** `200 OK` with array of 5 sample products

### Get Single Product
```bash
curl http://localhost:3000/api/v1/products/prod_1
```

**Expected:** `200 OK` with Laptop product details

### Get Non-existent Product (Edge Case)
```bash
curl http://localhost:3000/api/v1/products/prod_999
```

**Expected:** `404 Not Found`

---

## 4. Shopping Cart Flow

### Create Cart (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/v1/carts -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"userId\":\"customer-id-here\"}"
```

**Expected:** `201 Created` with cart object

**Save the cart ID as** `CART_ID`

### Add Item to Cart (Laptop - $999.99)
```bash
curl -X POST http://localhost:3000/api/v1/carts/<CART_ID>/items -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"productId\":\"prod_1\",\"quantity\":1}"
```

**Expected:** `200 OK` with updated cart

### Add Another Item (Mouse - $29.99)
```bash
curl -X POST http://localhost:3000/api/v1/carts/<CART_ID>/items -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"productId\":\"prod_2\",\"quantity\":2}"
```

**Expected:** `200 OK` with updated cart (2 items)

### Update Item Quantity
```bash
curl -X PUT http://localhost:3000/api/v1/carts/<CART_ID>/items/prod_1 -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"quantity\":2}"
```

**Expected:** `200 OK` with updated cart (Laptop quantity = 2)

### Get Cart
```bash
curl http://localhost:3000/api/v1/carts/<CART_ID> -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected:** `200 OK` with cart containing 2 Laptops and 2 Mice

### Remove Item from Cart
```bash
curl -X DELETE http://localhost:3000/api/v1/carts/<CART_ID>/items/prod_2 -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected:** `200 OK` with updated cart (only Laptop remains)

### Add Item with Insufficient Stock (Edge Case)
```bash
curl -X POST http://localhost:3000/api/v1/carts/<CART_ID>/items -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"productId\":\"prod_1\",\"quantity\":9999}"
```

**Expected:** `400 Bad Request` with insufficient stock error

---

## 5. Checkout & Order Placement

### Checkout Without Discount Code
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<CART_ID>\"}"
```

**Expected:** `200 OK` with order details and order number 1

### Place 9 More Orders (to trigger discount on 10th)

Repeat the following steps 9 times (changing cart each time):

1. Create new cart
2. Add item(s)
3. Checkout

**After 9th order:**
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<NEW_CART_ID>\"}"
```

**Expected:** Order #9 completes normally (no coupon)

**After 10th order:**
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<NEW_CART_ID>\"}"
```

**Expected:** Order #10 completes AND a 10% discount coupon is generated

**Save the discount code as** `DISCOUNT_CODE`

### Checkout With Valid Discount Code
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<NEW_CART_ID>\",\"discountCode\":\"<DISCOUNT_CODE>\"}"
```

**Expected:** `200 OK` with 10% discount applied to subtotal

### Checkout With Used Discount Code (Edge Case)
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<NEW_CART_ID>\",\"discountCode\":\"<DISCOUNT_CODE>\"}"
```

**Expected:** `400 Bad Request` - discount code already used

### Checkout With Invalid Discount Code (Edge Case)
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<NEW_CART_ID>\",\"discountCode\":\"INVALID123\"}"
```

**Expected:** `404 Not Found` or `400 Bad Request`

### Checkout Empty Cart (Edge Case)
```bash
curl -X POST http://localhost:3000/api/v1/checkout -H "Authorization: Bearer <CUSTOMER_TOKEN>" -H "Content-Type: application/json" -d "{\"cartId\":\"<EMPTY_CART_ID>\"}"
```

**Expected:** `400 Bad Request` - cannot checkout empty cart

---

## 6. Admin Endpoints

### Get Admin Stats (Requires Admin Role)
```bash
curl http://localhost:3000/api/v1/admin/stats -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** `200 OK` with:
- totalOrders
- totalRevenue
- totalItemsSold
- totalDiscountsGiven
- activeCouponCodes

### Get Admin Stats as Customer (Edge Case)
```bash
curl http://localhost:3000/api/v1/admin/stats -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected:** `403 Forbidden` - admin access required

### Manually Generate Discount Code
```bash
curl -X POST http://localhost:3000/api/v1/admin/coupons -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"discountPercent\":15,\"expiryDays\":30}"
```

**Expected:** `201 Created` with newly generated 15% discount code

### Get All Discount Codes
```bash
curl http://localhost:3000/api/v1/admin/coupons -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** `200 OK` with array of all discount codes (used and unused)

### Get Active Discount Codes Only
```bash
curl http://localhost:3000/api/v1/admin/coupons/active -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** `200 OK` with array of active (unused, non-expired) codes

---

## 7. Edge Cases & Error Handling

### 404 Not Found
```bash
curl http://localhost:3000/api/v1/unknown-endpoint
```

**Expected:** `404 Not Found` with structured error response

### Malformed JSON
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{invalid json"
```

**Expected:** `400 Bad Request` with JSON parse error

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\"}"
```

**Expected:** `400 Bad Request` - password and name required

### Weak Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"weak@example.com\",\"password\":\"123\",\"name\":\"Test User\"}"
```

**Expected:** `400 Bad Request` - password does not meet strength requirements

### Duplicate Email Registration
```bash
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"customer@example.com\",\"password\":\"Customer123\",\"name\":\"Duplicate User\"}"
```

**Expected:** `409 Conflict` - user already exists

---

## Summary of Expected Behavior

1. ✅ Health check and version endpoints work
2. ✅ User registration with validation
3. ✅ User login with JWT token generation
4. ✅ Token verification on protected routes
5. ✅ Public product browsing
6. ✅ Authenticated cart operations
7. ✅ Checkout flow with order creation
8. ✅ Every 10th order generates a 10% coupon
9. ✅ Discount codes are single-use
10. ✅ Admin endpoints require admin role
11. ✅ Proper error handling for all edge cases

---

## Notes

- All responses follow the `APIResponse` format: `{ success: boolean, data?: any, error?: ErrorObject }`
- JWT tokens expire after 30 days
- Cart expiration is handled automatically (24 hours from creation)
- Discount codes use ULID format (26 characters, time-sortable)
- All prices are in USD with 2 decimal places
- Stock is decremented on order completion
- Order IDs use format: `ORD_<timestamp>_<random>`

---

## Troubleshooting

**Issue:** "No authorization token provided"
- **Solution:** Make sure to include the `Authorization: Bearer <TOKEN>` header

**Issue:** "Admin access required"
- **Solution:** Update `.env` with `ADMIN_USER_IDS=<user-id>` and restart server

**Issue:** "Product not found"
- **Solution:** Use correct product IDs: `prod_1`, `prod_2`, `prod_3`, `prod_4`, `prod_5`

**Issue:** "Cart not found"
- **Solution:** Create a new cart first and use the returned cart ID
