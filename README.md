# Ecommerce Store - Industry-Ready Backend

A production-grade ecommerce store backend built with Express.js and TypeScript, featuring cart management, checkout flow, and a global discount coupon system.

## Features

- 🛒 Shopping cart management
- 💳 Checkout with discount codes
- 🎟️ Global nth-order discount coupon generation
- 📊 Admin analytics dashboard
- 🏗️ Clean architecture with repository pattern
- ✅ Comprehensive unit and integration tests
- 📝 Fully documented API

## Tech Stack

- **Backend:** Express.js, TypeScript
- **Storage:** In-memory (swappable to PostgreSQL)
- **Testing:** Jest, Supertest
- **Code Quality:** ESLint, Prettier

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

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## API Documentation

Full API documentation with examples is provided in the [README.md](./docs/api.md) file.

### Key Endpoints

**Products:**
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product by ID

**Cart:**
- `POST /api/v1/carts` - Create a new cart
- `GET /api/v1/carts/:cartId` - Get cart items
- `POST /api/v1/carts/:cartId/items` - Add item to cart
- `DELETE /api/v1/carts/:cartId/items/:itemId` - Remove item
- `PUT /api/v1/carts/:cartId/items/:itemId` - Update quantity

**Checkout:**
- `POST /api/v1/checkout` - Place order

**Admin:**
- `GET /api/v1/admin/stats` - Get analytics
- `POST /api/v1/admin/coupons` - Generate coupon

## Architecture

This project follows **Clean Architecture** principles:

- **Domain Layer** - Pure business logic, no external dependencies
- **Application Layer** - Use cases and orchestration
- **Infrastructure Layer** - Storage and external services
- **Presentation Layer** - Express routes and controllers

See [DECISIONS.md](./DECISIONS.md) for detailed design decisions and reasoning.

## Project Structure

```
src/
├── domain/          # Business logic, entities
├── application/     # Use cases
├── infrastructure/  # Storage, repositories
├── presentation/    # Express routes, controllers
├── shared/          # Error classes, types, utilities
└── config/          # Configuration, logger

tests/
├── unit/            # Unit tests for domain logic
└── integration/     # Integration tests for APIs

frontend/           # React SPA (coming soon)
docs/              # Documentation
```

## Design Decisions

See [DECISIONS.md](./DECISIONS.md) for comprehensive documentation of:

- Coupon distribution strategy
- Coupon validity model
- Code format (ULID)
- Architecture pattern (Repository + DI)
- Authentication strategy
- API versioning
- Error handling framework
- Testing strategy
- And more...

## Future Enhancements

- PostgreSQL integration with TypeORM
- JWT authentication
- Email notifications
- Admin role-based access control
- Rate limiting
- API documentation (Swagger)
- Monitoring and logging aggregation

## License

MIT

## Author

Jeet Jani
