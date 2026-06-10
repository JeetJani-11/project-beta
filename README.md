# Ecommerce Store - Industry-Ready Backend

A production-grade ecommerce store backend built with Express.js and TypeScript, featuring cart management, checkout flow, and a global discount coupon system.

## Features

- 🛒 Shopping cart management with inventory tracking
- 💳 Checkout with discount coupon validation
- 🎟️ Global nth-order discount coupon generation (every 10th order automatically generates a coupon)
- 🔐 JWT-based authentication and authorization
- 👥 User registration and login with secure password hashing
- 🛡️ Protected routes with role-based access control (admin/customer)
- 📊 Admin analytics dashboard with order stats and revenue tracking
- 💾 Dual storage support: In-Memory (dev) and Supabase PostgreSQL (production)
- 🏗️ Clean architecture with repository pattern (swappable storage)
- ✅ Comprehensive 95+ unit and integration tests
- 📝 Fully documented API with examples
- 🔒 Structured error handling with proper HTTP status codes

## Tech Stack

- **Backend:** Express.js, TypeScript (strict mode)
- **Authentication:** JWT with bcryptjs password hashing
- **Storage:** In-memory (dev), Supabase PostgreSQL (production)
- **Testing:** Jest (73+ domain tests), Supertest (integration tests)
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **API Design:** RESTful, versioned (/api/v1/)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/JeetJani-11/project-beta.git
cd project-beta

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Configure JWT secret (required for authentication)
# Edit .env and set: JWT_SECRET=your_random_secret_here

# Run development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Verify Installation

```bash
# Check health
curl http://localhost:3000/health

# List products
curl http://localhost:3000/api/v1/products
```

## Testing

### Run Automated Tests
```bash
npm test                # Run all 95 tests
npm run test:watch     # Watch mode for development
npm run test:coverage  # Generate coverage report
```

**All tests should pass:**
```
Test Suites: 6 passed, 6 total
Tests:       95 passed, 95 total
Time:        ~3 seconds
```

### Manual API Testing

See **[docs/TESTING.md](./docs/TESTING.md)** for comprehensive testing guide including:
- ✅ Complete curl command examples for all endpoints
- ✅ Postman/REST Client setup instructions
- ✅ All test scenarios (auth, cart, checkout, admin, errors)
- ✅ Step-by-step testing workflow
- ✅ Troubleshooting guide

**Quick Test Example:**
```bash
# 1. Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# 2. Login (save the token from response)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Test protected endpoint (replace YOUR_TOKEN)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

For detailed testing instructions with all edge cases, see [docs/MANUAL_VERIFICATION.md](./docs/MANUAL_VERIFICATION.md).

## Supabase Setup (Optional - for PostgreSQL)

The app uses in-memory storage by default. To use Supabase PostgreSQL:

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create account
2. Create a new project
3. Save your project URL and service role key

### 2. Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy contents of `docs/supabase-schema.sql`
3. Execute the SQL to create tables and seed data

### 3. Configure Environment
Edit `.env` file:
```bash
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Restart Server
```bash
npm run dev
```

The app will now use Supabase PostgreSQL instead of in-memory storage.

### Verify Installation

```bash
# Check health
curl http://localhost:3000/health

# List products
curl http://localhost:3000/api/v1/products
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern="domain"
```

**See [docs/TESTING.md](./docs/TESTING.md) for complete testing guide.**

## Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Build project
npm run build
```

## API Documentation

### Authentication

All cart, checkout, and admin endpoints require authentication. Include JWT token in request headers:

```
Authorization: Bearer <your_jwt_token>
```

### Base URL
```
http://localhost:3000/api/v1
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... },
    "timestamp": "2026-06-10T19:00:00.000Z"
  }
}
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "createdAt": "2026-06-10T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

### Products Endpoints

#### List All Products
```http
GET /api/v1/products
```

#### Get Single Product
```http
GET /api/v1/products/:id
```

### Cart Endpoints

#### Create Cart
```http
POST /api/v1/carts
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_123"
}
```

#### Get Cart
```http
GET /api/v1/carts/:cartId
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/v1/carts/:cartId/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "prod_1",
  "quantity": 2
}
```

#### Remove Item from Cart
```http
DELETE /api/v1/carts/:cartId/items/:productId
Authorization: Bearer <token>
```

#### Update Item Quantity
```http
PUT /api/v1/carts/:cartId/items/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

### Checkout Endpoint

#### Place Order
```http
POST /api/v1/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "cartId": "cart_xxx",
  "userId": "user_123",
  "couponCode": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```

**Response (on 10th order - earns coupon):**
```json
{
  "success": true,
  "data": {
    "order": { ... },
    "message": "Congratulations! You earned a discount coupon!",
    "earnedCoupon": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "earnedDiscount": "10%"
  }
}
```

### Admin Endpoints

**Note:** All admin endpoints require authentication with admin role.

#### Get Statistics
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin_token>
```

#### Generate Coupon
```http
POST /api/v1/admin/coupons
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "discountPercent": 15,
  "expiryDays": 60
}
```

#### List All Coupons
```http
GET /api/v1/admin/coupons
Authorization: Bearer <admin_token>
```

#### List Active Coupons
```http
GET /api/v1/admin/coupons/active
Authorization: Bearer <admin_token>
```

## Example Flow

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "Customer123", "name": "John Doe"}'

# Save the token from response

# 2. Create cart
curl -X POST http://localhost:3000/api/v1/carts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'

# 3. Add items
curl -X POST http://localhost:3000/api/v1/carts/CART_ID/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_1", "quantity": 2}'

# 4. Checkout (will generate coupon on 10th order)
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"cartId": "CART_ID", "userId": "user_123"}'

# 5. View admin stats (requires admin role)
curl http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

For complete manual testing guide with all edge cases, see [MANUAL_VERIFICATION.md](./MANUAL_VERIFICATION.md).

## Project Structure

```
src/
├── domain/              # Business logic (pure, no dependencies)
│   └── services/        # AuthService, DiscountService, CartService, OrderService
├── infrastructure/      # Storage, repositories
│   ├── repositories/    # InMemoryRepository, SupabaseRepository
│   └── StorageFactory.ts # Toggle between storage implementations
├── presentation/        # Express routes and controllers
│   ├── controllers/     # AuthController, CartController, CheckoutController, etc
│   ├── middleware/      # authMiddleware, errorHandler, requestLogger
│   ├── routes/          # API route definitions
│   └── app.ts           # Express configuration
├── shared/              # Common utilities
│   ├── errors/          # Custom error classes
│   ├── types/           # Type definitions
│   └── utils/           # Helper functions
└── config/              # logger, supabase

tests/
├── unit/                # Unit tests (domain logic)
│   ├── domain/          # AuthService, DiscountService, CartService, OrderService tests
│   └── shared/          # Error classes tests
└── integration/         # Integration tests (APIs)
```

## Design Decisions

See [docs/DECISIONS.md](./docs/DECISIONS.md) for comprehensive documentation of:

- Coupon distribution strategy (loyalty-based)
- Coupon validity model (single-use + 30-day expiry)
- Code format (ULID)
- Architecture pattern (Repository + Dependency Injection)
- Authentication strategy (JWT-ready)
- API versioning (path-based)
- Error handling framework
- Testing strategy
- Database migration path
- 4 more key decisions...

## Architecture Highlights

### Clean Architecture Layers
- **Domain**: Pure business logic, testable, no dependencies
- **Application**: Use cases, orchestration
- **Infrastructure**: Storage (swappable with Repository pattern)
- **Presentation**: Express routes and controllers

### Key Features
- **JWT Authentication**: Secure user registration and login with bcrypt password hashing
- **Role-Based Access Control**: Customer and admin roles with protected routes
- **Nth Order Coupon System**: Every 10th order generates 10% discount coupon
- **Dual Storage Support**: In-memory (dev) and Supabase PostgreSQL (production)
- **Repository Pattern**: Swappable storage implementation without changing business logic
- **Structured Errors**: Consistent JSON error responses with HTTP codes
- **Full Test Coverage**: 95+ tests (domain logic 90%+ covered)

## Test Results

```
Test Suites: 6 passed
Tests:       95 passed
  - Errors: 12 tests
  - Integration: 6 tests
  - AuthService: 22 tests
  - DiscountService: 20 tests
  - CartService: 18 tests
  - OrderService: 13 tests
Time: ~3-4 seconds
```

## Future Enhancements

1. ~~**Database**: PostgreSQL with TypeORM (repository pattern ready)~~ ✅ **DONE** - Supabase PostgreSQL integrated
2. ~~**Authentication**: JWT tokens and user registration~~ ✅ **DONE** - Full JWT auth with bcrypt
3. ~~**Admin Authorization**: Role-based access control~~ ✅ **DONE** - Admin/customer roles
4. **Email Notifications**: Order confirmations and coupons
5. **Payment Gateway**: Stripe integration
6. **Rate Limiting**: API abuse protection
7. **Caching**: Redis for products and stats
8. **Monitoring**: Error tracking and analytics

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Contributing

This is an assignment submission showcasing industry-ready ecommerce backend design. See [DECISIONS.md](./DECISIONS.md) for design rationale.

## License

MIT

## Author

Jeet Jani
