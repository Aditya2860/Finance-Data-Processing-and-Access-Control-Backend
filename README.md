# Finance Backend API

A professional, role-based finance data management backend built with Node.js, Express, Prisma, and SQLite.

-------------------------------------------------

## Architecture: Clean Layered Design

This project follows the **Clean Architecture** pattern to ensure separation of concerns, high maintainability, and easy scalability:

- **Routes**: Define the API endpoints and wire up middleware chains.
- **Controllers**: Handle the Request/Response cycle, validate inputs (via Zod), and format responses.
- **Services**: Contain the core business logic and interact with the database via Prisma.
- **Middleware**: Interceptors for Authentication, Role-Based Access Control (RBAC), and Logging.
- **Config**: Centralized environment variable management.
- **Constants**: Shared enums for Roles and Transaction Types to eliminate magic strings.

---

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: SQLite (via Prisma ORM)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod
- **Code Style**: Prettier

-------------------------------------------------

## Setup Instructions

### 1. Clone and install
```bash
git clone <repository_url>
cd finance-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your values.

### 3. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 4. Seed with test data
```bash
npm run db:seed
```

### 5. Start the server
```bash
npm run dev        # development (with hot reload)
npm start          # production
```

-------------------------------------------------

## API Endpoints

### Auth
| Method | Endpoint             | Auth | Description       |
| :---   | :---                 | :--- | :---              |
| POST   | `/api/auth/register` | No   | Register new user  |
| POST   | `/api/auth/login`    | No   | Login, get token  |

### Users
| Method | Endpoint             | Role  | Description         |
| :---   | :---                 | :---  | :---                |
| GET    | `/api/users`         | ADMIN | Get all users       |
| GET    | `/api/users/me`      | ANY   | Get own profile     |
| GET    | `/api/users/:id`     | ADMIN | Get user by ID      |
| PATCH  | `/api/users/:id`     | ADMIN | Update role/status  |
| DELETE | `/api/users/:id`     | ADMIN | Delete user         |

### Records
| Method | Endpoint             | Role  | Description         |
| :---   | :---                 | :---  | :---                |
| POST   | `/api/records`       | ADMIN | Create transaction  |
| GET    | `/api/records`       | ANY   | List with filters   |
| GET    | `/api/records/:id`   | ANY   | Get single record   |
| PATCH  | `/api/records/:id`   | ADMIN | Update record       |
| DELETE | `/api/records/:id`   | ADMIN | Delete record       |

### Dashboard
| Method | Endpoint                    | Role           | Description           |
| :---   | :---                        | :---           | :---                  |
| GET    | `/api/dashboard`            | ADMIN, ANALYST | Full dashboard        |
| GET    | `/api/dashboard/summary`    | ANY            | Income/expense totals |
| GET    | `/api/dashboard/categories` | ADMIN, ANALYST | Category breakdown    |
| GET    | `/api/dashboard/trends`     | ADMIN, ANALYST | Monthly trends        |
| GET    | `/api/dashboard/recent`     | ANY            | Recent activity       |

-------------------------------------------------

## Role Permissions

| Action                      | VIEWER | ANALYST  | ADMIN  |
| :---                        | :---:  | :---:    | :---:  |
| View records                | ✅     | ✅      | ✅    |
| Create/edit/delete records  | ❌     | ❌      | ✅    |
| View summary & recent       | ✅     | ✅      | ✅    |
| View categories & trends    | ❌     | ✅      | ✅    |
| Manage users                | ❌     | ❌      | ✅    |

-------------------------------------------------

## Project Structure
```
src/
├── config/          # Centralized configuration
├── constants/       # Global constants and enums
├── controllers/     # HTTP Request/Response handlers
├── routes/          # API route definitions
├── services/        # Business logic & Database interaction
├── middleware/      # Auth, RBAC, error handling, logging
├── validators/      # Zod validation schemas
├── utils/           # Shared utility functions
└── app.js           # Express app setup
```
