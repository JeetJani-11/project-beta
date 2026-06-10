# Design Decisions

This document outlines the major architectural and design decisions made during the ecommerce store implementation.

## Decision 1: Coupon Distribution Strategy

**Context:** When every nth order is completed, we need to decide who receives the discount coupon.

**Options Considered:**
- Option A: Reward coupon to the customer who triggered it (loyalty-based)
- Option B: Random future customer gets the coupon (gamification)
- Option C: Coupons go to admin pool for manual distribution

**Choice:** Option A - Reward to triggering customer

**Why:** 
- Creates predictable loyalty rewards that encourage repeat purchases
- Better user experience - customers know they earned their discount
- Simpler to implement and understand
- Aligns with industry-standard loyalty programs

---

## Decision 2: Coupon Validity Model

**Context:** Discount codes need rules around how they can be used and when they expire.

**Options Considered:**
- Option A: Single-use only (can apply to one order only)
- Option B: Reusable with redemption limits (e.g., max 5 uses)
- Option C: Time-limited only (expires after 30 days regardless of usage)
- Option D: Both single-use AND time-limited (combines both constraints)

**Choice:** Option D - Single-use AND time-limited (30 days)

**Why:**
- Single-use prevents abuse and limits exploitation
- Time-limit encourages customers to make purchases soon
- Industry best-practice for promotional codes
- Balances customer satisfaction with business protection
- Creates sense of urgency

---

## Decision 3: Discount Code Format

**Context:** We need to generate unique, secure, and user-friendly discount codes.

**Options Considered:**
- Option A: UUID v4 (e.g., 550e8400-e29b-41d4-a716-446655440000) - Cryptographically secure
- Option B: Sequential alphanumeric (e.g., DISC00001) - Simple but predictable
- Option C: Promo-style codes (e.g., SUMMER2025SAVE10) - Memorable but hard to generate uniquely
- Option D: ULID (e.g., 01ARZ3NDEKTSV4RRFFQ69G5FAV) - Sortable, readable, secure

**Choice:** Option D - ULID (ulidjs library)

**Why:**
- Combines security of UUIDs with readability and sortability
- Sortable by timestamp (better for database queries later)
- More user-friendly than full UUID (shorter display)
- Becomes easier to debug with more readable IDs
- Industry adoption growing (used by many modern APIs)

---

## Decision 4: Architecture Pattern for Storage Layer

**Context:** We need to support in-memory storage now but be able to swap to PostgreSQL/MongoDB later without changing business logic.

**Options Considered:**
- Option A: Direct storage in controllers (tightly coupled, hard to test)
- Option B: Repository pattern with interfaces (abstraction layer)
- Option C: ORM dependency from day 1 (TypeORM, Prisma)
- Option D: Event sourcing with event store

**Choice:** Option B - Repository pattern with Dependency Injection

**Why:**
- Clean separation between business logic and storage implementation
- Easy to swap in-memory → PostgreSQL later without touching domain logic
- Highly testable: can inject mock repositories in tests
- Follows SOLID principles (Dependency Inversion)
- Minimal complexity, maximum flexibility
- No vendor lock-in to ORM

---

## Decision 5: Authentication Strategy

**Context:** API needs to authenticate customers for their carts and orders, and admins for analytics endpoints.

**Options Considered:**
- Option A: No authentication (mock userId in headers) - MVP only
- Option B: Session-based with cookies
- Option C: JWT tokens for customers, API keys for admin
- Option D: OAuth2 with third-party providers

**Choice:** Option C - JWT for customers, Bearer tokens for admin

**Why:**
- JWT is stateless and scales horizontally
- Can be extended to OAuth2 later without major refactoring
- Supports both mobile and web clients easily
- Admin endpoints can have stricter token validation
- Industry standard for APIs
- For this MVP: mock user context, ready for real JWT later

---

## Decision 6: API Versioning Strategy

**Context:** APIs may evolve; we need a versioning strategy that's explicit and future-proof.

**Options Considered:**
- Option A: No versioning (fragile, breaks clients)
- Option B: URL path versioning (/api/v1/products, /api/v2/products)
- Option C: Header-based versioning (Accept: application/vnd.api+v1+json)
- Option D: Subdomain versioning (v1.api.example.com)

**Choice:** Option B - URL path versioning (/api/v1/...)

**Why:**
- Most explicit and easy to understand
- Easy to test different versions
- Standard practice in industry (GitHub, Stripe, etc.)
- No hidden requirements in headers
- Simple for clients and developers
- Clear URL shows exactly which version is being used

---

## Decision 7: Cart State Management (Frontend)

**Context:** Customers need a persistent shopping cart experience across page refreshes and browser sessions.

**Options Considered:**
- Option A: Session-only (lost on page refresh, simple)
- Option B: Browser localStorage only (no server state needed)
- Option C: Server-side cart with unique cartId in localStorage
- Option D: Hybrid - localStorage for quick access + server validation

**Choice:** Option C - Server-side with localStorage cartId

**Why:**
- Supports guest checkout (unique cartId, no user login needed)
- Cart persists across devices/browsers
- Server is source of truth for inventory consistency
- Prevents client-side manipulation of prices
- Scales better for future multi-device support
- Clear separation: client tracks cartId, server owns cart data
- Better for fraud prevention

---

## Decision 8: Error Handling Framework

**Context:** API needs consistent, structured error responses that help debugging and client handling.

**Options Considered:**
- Option A: Generic HTTP status codes only (minimal info)
- Option B: Custom error classes with middleware handling
- Option C: Third-party error handling library
- Option D: Error codes + messages only (no stack traces)

**Choice:** Option B - Custom error classes with centralized middleware

**Why:**
- Structured error responses (code, message, details, timestamp)
- Easy for frontend to parse and show appropriate messages
- Single middleware catches all errors consistently
- Custom error types (ValidationError, NotFoundError, etc.) make code expressive
- Stack traces in development, clean responses in production
- Easier to log and monitor errors later
- Extensible: easy to add new error types

---

## Decision 9: Database Migration Path

**Context:** Currently using in-memory storage, but may need PostgreSQL later for persistence and scaling.

**Options Considered:**
- Option A: In-memory only, redesign for DB later
- Option B: Design schema now, implement in-memory with migration path
- Option C: Start with PostgreSQL immediately
- Option D: Document ORM strategy but don't implement yet

**Choice:** Option B - Design schema now, in-memory implementation ready for migration

**Why:**
- Repository pattern already enables this
- Can plan indexes and relationships before needing them
- When time to migrate, structure is already thought through
- Avoids major refactoring later
- Supports querying patterns we need (order count, coupon lookups, etc)
- No overhead: just thoughtful schema design up front

---

## Decision 10: Testing Strategy

**Context:** Need to ensure code quality and business logic correctness.

**Options Considered:**
- Option A: Manual testing only (risky, not scalable)
- Option B: Unit tests only (fast, but not full coverage)
- Option C: Integration tests with mocked dependencies
- Option D: Full pyramid - Unit + Integration + E2E tests

**Choice:** Option D - Full test pyramid with focus on integration tests

**Why:**
- Unit tests validate individual functions (discount calculation, validation)
- Integration tests verify full API flows (add-to-cart → checkout)
- E2E tests can verify frontend + backend together
- Jest + Supertest allows testing Express endpoints easily
- Fast feedback during development
- Confidence when refactoring
- 80%+ coverage target for domain and application layers

---

## Decision 11: Project Structure - Clean Architecture

**Context:** How to organize code for maintainability, testability, and scalability.

**Options Considered:**
- Option A: Feature-based folders (/features/cart, /features/checkout)
- Option B: Layer-based folders (/controllers, /services, /models)
- Option C: Clean architecture layers (/domain, /application, /infrastructure)
- Option D: Monolithic single folder

**Choice:** Option C - Clean architecture with layers

**Why:**
- Domain layer: Pure business logic, no dependencies
- Application layer: Use cases, orchestration
- Infrastructure layer: Storage, external services
- Presentation layer: Express routes and controllers
- Testability: domain layer has zero dependencies
- Clear separation of concerns
- Easier to reason about code flow
- Natural growth path to microservices later

---

## Decision 12: Frontend Framework Choice

**Context:** Building customer-facing UI to demonstrate the ecommerce flow.

**Options Considered:**
- Option A: Vanilla JavaScript (no dependencies)
- Option B: jQuery + templates (simple)
- Option C: React with TypeScript (modern, component-based)
- Option D: Vue.js (lightweight, similar benefits)

**Choice:** Option C - React with TypeScript

**Why:**
- React is industry-standard, marketable skill
- TypeScript catches bugs at compile-time
- Component reusability (ProductCard, CartItem, etc)
- Rich ecosystem (React Router, Axios)
- State management via Context API (sufficient for this scope)
- Demonstrates modern frontend best practices
- Large community, easy to find resources

---

## Decision 13: Nth Order Trigger - Global vs Per-Customer

**Context:** When counting orders for discount triggers, should we count globally across all customers or per-customer?

**Options Considered:**
- Option A: Global counter (every 10th order system-wide)
- Option B: Per-customer counter (every 10th order per customer)

**Choice:** Option A - Global counter

**Why:**
- Assignment specification: "Every nth order gets a coupon"
- Simpler to implement and reason about
- Creates lottery-like excitement (random customer gets reward)
- Easier to track for analytics
- Business incentive: drives volume-based growth
- If B was wanted: can be added as future enhancement

---

## Future Considerations

These decisions were deferred to keep scope manageable but are noted for future implementation:

1. **Rate Limiting** - Protect endpoints from abuse (express-rate-limit)
2. **Caching** - Cache product listings and user carts (Redis)
3. **Real Database** - Migrate to PostgreSQL with TypeORM
4. **Internationalization** - Support multiple currencies and languages
5. **Payment Gateway Integration** - Stripe or similar for real payments
6. **Admin Authorization** - Role-based access control (RBAC)
7. **Monitoring & Logging** - Log aggregation, error tracking (Sentry)
8. **API Documentation** - Auto-generated OpenAPI/Swagger docs
9. **Email Notifications** - Order confirmations, coupon notifications
10. **Analytics** - Track user behavior, conversion funnels

---

## Revision History

- **June 11, 2026** - Initial decisions documented during planning phase
