# Testing Guide

Complete guide for testing the Ecommerce Backend API.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Running Automated Tests](#running-automated-tests)
3. [Manual API Testing](#manual-api-testing)
4. [Testing Tools](#testing-tools)
5. [Test Scenarios](#test-scenarios)

---

## Quick Start

### Prerequisites
```bash
# Install Node.js 18+
node --version  # Should be v18 or higher

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and set JWT_SECRET=your_secret_key_here
```

### Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will be available at: `http://localhost:3000`

---

## Running Automated Tests

### Run All Tests
```bash
npm test
```

**Expected Output:**
```
Test Suites: 6 passed, 6 total
Tests:       95 passed, 95 total
Time:        ~3 seconds
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```
- Automatically re-runs tests on file changes
- Great for development

### Run Tests with Coverage
```bash
npm run test:coverage
```
- Generates coverage report in `coverage/` folder
- Shows which lines of code are tested

### Run Specific Test Suite
```bash
# Run only AuthService tests
npm test -- AuthService.test.ts

# Run only domain tests
npm test -- --testPathPattern=domain

# Run only integration tests
npm test -- --testPathPattern=integration
```

---

## Manual API Testing

You can test the API using:
1. **curl** (command line)
2. **Postman** (GUI tool)
3. **Thunder Client** (VS Code extension)
4. **REST Client** (VS Code extension)

### Option 1: Using curl (Recommended)

See detailed examples in [MANUAL_VERIFICATION.md](./MANUAL_VERIFICATION.md)

**Quick Example:**
```bash
# 1. Check health
curl http://localhost:3000/health

# 2. Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test User\"}"

# Save the token from the response

# 3. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\"}"

# 4. Get products
curl http://localhost:3000/api/v1/products

# 5. Create cart (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/api/v1/carts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user-id\"}"
```

### Option 2: Using Postman

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import Collection**: Use the examples below to create requests
3. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: (will be set after login)

**Postman Request Examples:**

**Register:**
- Method: `POST`
- URL: `{{baseUrl}}/auth/register`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}
```

**Login:**
- Method: `POST`
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!"
}
```
- After response: Copy the `token` value and set it in environment variables

**Get Products:**
- Method: `GET`
- URL: `{{baseUrl}}/products`

**Create Cart:**
- Method: `POST`
- URL: `{{baseUrl}}/carts`
- Headers: `Authorization: Bearer {{token}}`
- Body (JSON):
```json
{
  "userId": "test-user-id"
}
```

### Option 3: Using VS Code REST Client

1. Install "REST Client" extension in VS Code
2. Create a file `test-api.http`
3. Add the following:

```http
### Variables
@baseUrl = http://localhost:3000/api/v1
@token = YOUR_TOKEN_HERE

### Health Check
GET http://localhost:3000/health

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### Get All Products
GET {{baseUrl}}/products

### Create Cart
POST {{baseUrl}}/carts
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userId": "test-user-id"
}
```

4. Click "Send Request" above each request

---

## Testing Tools

### Build Verification
```bash
# Check TypeScript compilation
npm run build

# Expected: No errors, creates dist/ folder
```

### Linting
```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Code Formatting
```bash
# Format all code
npm run format
```

---

## Test Scenarios

### 1. User Authentication Flow

**Test Case: Register New User**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Secure123","name":"New User"}'
```
✅ **Expected**: 201 Created, returns user object + JWT token

**Test Case: Login with Correct Credentials**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Secure123"}'
```
✅ **Expected**: 200 OK, returns user object + JWT token

**Test Case: Login with Wrong Password**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"WrongPass"}'
```
✅ **Expected**: 401 Unauthorized

**Test Case: Duplicate Email Registration**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Secure123","name":"Duplicate"}'
```
✅ **Expected**: 409 Conflict

---

### 2. Shopping Cart Flow

**Test Case: Browse Products (No Auth Required)**
```bash
curl http://localhost:3000/api/v1/products
```
✅ **Expected**: 200 OK, array of 5 products

**Test Case: Create Cart (Auth Required)**
```bash
curl -X POST http://localhost:3000/api/v1/carts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123"}'
```
✅ **Expected**: 201 Created, returns cart with ID

**Test Case: Add Item to Cart**
```bash
curl -X POST http://localhost:3000/api/v1/carts/CART_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_1","quantity":2}'
```
✅ **Expected**: 200 OK, cart updated with 2 Laptops

**Test Case: Update Item Quantity**
```bash
curl -X PUT http://localhost:3000/api/v1/carts/CART_ID/items/prod_1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'
```
✅ **Expected**: 200 OK, quantity updated to 5

**Test Case: Remove Item from Cart**
```bash
curl -X DELETE http://localhost:3000/api/v1/carts/CART_ID/items/prod_1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
✅ **Expected**: 200 OK, item removed

---

### 3. Checkout and Discount Flow

**Test Case: Checkout Without Discount**
```bash
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"CART_ID","userId":"user123"}'
```
✅ **Expected**: 200 OK, order created

**Test Case: 10th Order Gets Coupon**
```bash
# Place 10 orders sequentially
# On the 10th order:
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"CART_ID_10","userId":"user123"}'
```
✅ **Expected**: 200 OK, order created + coupon code in response

**Test Case: Use Discount Code**
```bash
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"CART_ID","userId":"user123","discountCode":"COUPON_CODE"}'
```
✅ **Expected**: 200 OK, 10% discount applied

**Test Case: Reuse Discount Code (Should Fail)**
```bash
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"CART_ID","userId":"user123","discountCode":"USED_COUPON"}'
```
✅ **Expected**: 400 Bad Request, "Coupon already used"

---

### 4. Admin Operations

**Setup Admin User:**
1. Register a user
2. Get the user ID from response
3. Update `.env` file: `ADMIN_USER_IDS=user-id-here`
4. Restart server
5. Or manually update user role to 'admin' in database

**Test Case: Get Admin Stats**
```bash
curl http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
✅ **Expected**: 200 OK, returns stats (orders, revenue, etc.)

**Test Case: Generate Discount Code**
```bash
curl -X POST http://localhost:3000/api/v1/admin/coupons \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"discountPercent":15,"expiryDays":30}'
```
✅ **Expected**: 201 Created, returns new coupon code

**Test Case: Customer Accessing Admin Route (Should Fail)**
```bash
curl http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```
✅ **Expected**: 403 Forbidden

---

### 5. Error Handling

**Test Case: Access Protected Route Without Token**
```bash
curl http://localhost:3000/api/v1/auth/me
```
✅ **Expected**: 401 Unauthorized

**Test Case: Invalid Token**
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer invalid-token-here"
```
✅ **Expected**: 401 Unauthorized

**Test Case: Malformed JSON**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{invalid json'
```
✅ **Expected**: 400 Bad Request

**Test Case: Missing Required Fields**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```
✅ **Expected**: 400 Bad Request, "Password and name are required"

**Test Case: Weak Password**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'
```
✅ **Expected**: 400 Bad Request, password requirements not met

---

## Complete Test Workflow

Follow this workflow to test the entire application:

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Run Automated Tests
```bash
npm test
```
Verify all 95 tests pass.

### Step 3: Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Step 4: Test User Registration
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"Customer123","name":"John Doe"}'
```
**Save the token from response.**

### Step 5: Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"Customer123"}'
```

### Step 6: Test Protected Endpoint
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 7: Browse Products
```bash
curl http://localhost:3000/api/v1/products
```

### Step 8: Create Cart and Add Items
```bash
# Create cart
curl -X POST http://localhost:3000/api/v1/carts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123"}'

# Save CART_ID from response

# Add laptop to cart
curl -X POST http://localhost:3000/api/v1/carts/CART_ID/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_1","quantity":1}'
```

### Step 9: Checkout
```bash
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"CART_ID","userId":"user123"}'
```

### Step 10: Test Admin Endpoints
```bash
# First, make your user an admin:
# 1. Get user ID from registration response
# 2. Add to .env: ADMIN_USER_IDS=user-id
# 3. Restart server

# Get stats
curl http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Issue: "No authorization token provided"
**Solution**: Add the Authorization header:
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Issue: "Admin access required"
**Solution**: 
1. Get your user ID from registration/login response
2. Add to `.env`: `ADMIN_USER_IDS=your-user-id`
3. Restart the server

### Issue: "Product not found"
**Solution**: Use valid product IDs:
- `prod_1` - Laptop ($999.99)
- `prod_2` - Wireless Mouse ($29.99)
- `prod_3` - Mechanical Keyboard ($149.99)
- `prod_4` - USB-C Cable ($12.99)
- `prod_5` - Monitor Stand ($49.99)

### Issue: Tests failing
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear dist folder and rebuild
rm -rf dist
npm run build

# Run tests
npm test
```

### Issue: Port 3000 already in use
**Solution**: Change port in `.env`:
```bash
PORT=3001
```

---

## CI/CD Testing

For automated testing in CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Build project
npm run build

# Run tests with coverage
npm run test:coverage

# Check coverage thresholds (optional)
# Configure in jest.config.js
```

**GitHub Actions Example:**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## Additional Resources

- **Full API Documentation**: See [README.md](./README.md)
- **Manual Testing Guide**: See [docs/MANUAL_VERIFICATION.md](./docs/MANUAL_VERIFICATION.md)
- **Supabase Setup**: See [README.md#supabase-setup](./README.md#supabase-setup)
- **Project Decisions**: See [docs/DECISIONS.md](./docs/DECISIONS.md)

---

## Getting Help

If tests fail or you encounter issues:

1. Check server logs for error messages
2. Verify `.env` configuration
3. Ensure JWT_SECRET is set
4. Check database connection (if using Supabase)
5. Verify Node.js version (18+)
6. Review [MANUAL_VERIFICATION.md](./MANUAL_VERIFICATION.md) for working examples

---

**Happy Testing! 🚀**
