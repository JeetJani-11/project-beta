# Ecommerce Store - Industry-Ready Backend

A production-grade ecommerce store backend built with Express.js and TypeScript, featuring cart management, checkout flow, and a global discount coupon system.

## Features

- 🛒 Shopping cart management with inventory tracking
- 💳 Checkout with discount coupon validation
- 🎟️ Global nth-order discount coupon generation (every 10th order automatically generates a coupon)
- 📊 Admin analytics dashboard with order stats and revenue tracking
- 🏗️ Clean architecture with repository pattern (swappable storage)
- ✅ Comprehensive 69+ unit and integration tests
- 📝 Fully documented API with examples
- 🔒 Structured error handling with proper HTTP status codes

## Tech Stack

- **Backend:** Express.js, TypeScript (strict mode)
- **Storage:** In-memory (repository pattern allows PostgreSQL migration)
- **Testing:** Jest (51+ domain tests), Supertest (integration tests)
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
Content-Type: application/json

{
  "userId": "user_123"
}
```

#### Get Cart
```http
GET /api/v1/carts/:cartId
```

#### Add Item to Cart
```http
POST /api/v1/carts/:cartId/items
Content-Type: application/json

{
  "productId": "prod_1",
  "quantity": 2
}
```

#### Remove Item from Cart
```http
DELETE /api/v1/carts/:cartId/items/:productId
```

#### Update Item Quantity
```http
PUT /api/v1/carts/:cartId/items/:productId
Content-Type: application/json

{
  "quantity": 5
}
```

### Checkout Endpoint

#### Place Order
```http
POST /api/v1/checkout
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

#### Get Statistics
```http
GET /api/v1/admin/stats
```

#### Generate Coupon
```http
POST /api/v1/admin/coupons
Content-Type: application/json

{
  "discountPercent": 15,
  "expiryDays": 60
}
```

#### List All Coupons
```http
GET /api/v1/admin/coupons
```

#### List Active Coupons
```http
GET /api/v1/admin/coupons/active
```

## Example Flow

```bash
# 1. Create cart
curl -X POST http://localhost:3000/api/v1/carts \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'

# 2. Add items
curl -X POST http://localhost:3000/api/v1/carts/CART_ID/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_1", "quantity": 2}'

# 3. Checkout (will generate coupon on 10th order)
curl -X POST http://localhost:3000/api/v1/checkout \
  -H "Content-Type: application/json" \
  -d '{"cartId": "CART_ID", "userId": "user_123"}'

# 4. View admin stats
curl http://localhost:3000/api/v1/admin/stats
```

## Project Structure

```
src/
├── domain/              # Business logic (pure, no dependencies)
│   └── services/        # DiscountService, CartService, OrderService
├── infrastructure/      # Storage, repositories
│   └── repositories/    # InMemoryRepository
├── presentation/        # Express routes and controllers
│   ├── controllers/     # CartController, CheckoutController, etc
│   ├── middleware/      # Error handling, logging
│   ├── routes/          # API route definitions
│   └── app.ts           # Express configuration
├── shared/              # Common utilities
│   ├── errors/          # Custom error classes
│   ├── types/           # Type definitions
│   └── utils/           # Helper functions
└── config/              # Configuration, logger

tests/
├── unit/                # Unit tests (domain logic)
│   └── domain/          # DiscountService, CartService, OrderService tests
└── integration/         # Integration tests (APIs)
```

## Design Decisions

See [DECISIONS.md](./DECISIONS.md) for comprehensive documentation of:

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
- **Nth Order Coupon System**: Every 10th order generates 10% discount coupon
- **Repository Pattern**: In-memory now, PostgreSQL later (same interface)
- **Structured Errors**: Consistent JSON error responses with HTTP codes
- **Full Test Coverage**: 69+ tests (domain logic 90%+ covered)

## Test Results

```
Test Suites: 5 passed
Tests:       69 passed
  - Errors: 12 tests
  - Integration: 6 tests
  - DiscountService: 20 tests
  - CartService: 18 tests
  - OrderService: 13 tests
Time: ~3 seconds
```

## Future Enhancements

1. **Database**: PostgreSQL with TypeORM (repository pattern ready)
2. **Authentication**: JWT tokens and user registration
3. **Admin Authorization**: Role-based access control
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
