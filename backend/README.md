# EquipDriver Backend API

A scalable, production-ready RESTful API for the **EquipDriver** Heavy Equipment Driver Marketplace in India.

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Authentication | JWT (Access + Refresh Tokens) |
| Password Hashing | bcryptjs |
| Payment Gateway | Razorpay |
| Logging | Winston |
| Rate Limiting | express-rate-limit |
| Security | Helmet, CORS |
| Validation | express-validator |

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js         # PostgreSQL connection pool
│   └── logger.js           # Winston logger setup
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── driversController.js# Driver management
│   ├── jobsController.js   # Job posting and management
│   ├── paymentsController.js# Razorpay payment integration
│   ├── notificationsController.js # Notification system
│   └── adminController.js  # Admin dashboard & management
├── database/
│   └── schema.sql          # Complete PostgreSQL schema
├── middleware/
│   ├── auth.js             # JWT + RBAC middleware
│   └── errorHandler.js     # Centralized error handling
├── routes/
│   ├── auth.js             # /api/auth
│   ├── drivers.js          # /api/drivers
│   ├── jobs.js             # /api/jobs
│   ├── payments.js         # /api/payments
│   ├── notifications.js    # /api/notifications
│   └── admin.js            # /api/admin
├── scripts/
│   ├── setup-db.js         # Database schema setup
│   └── seed.js             # Seed sample data
├── uploads/                # Document uploads (gitignored)
├── logs/                   # Server logs (gitignored)
├── .env                    # Environment variables
├── .env.example            # Example env file
├── server.js               # Main server entry point
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment
Edit `.env` with your credentials:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=equipdriver
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT (change in production!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
```

### 3. Create Database
```bash
# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE equipdriver;"

# Apply schema
npm run db:setup
```

### 4. Seed Sample Data (Optional)
```bash
npm run db:seed
```

### 5. Start the Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server runs at **http://localhost:5000**

---

## 🔐 Authentication

The API uses JWT Bearer tokens. Include the Authorization header:
```
Authorization: Bearer <access_token>
```

### User Roles
| Role | Access |
|------|--------|
| `admin` | Full access - manage everything |
| `company` | Post jobs, view applications, make payments |
| `driver` | Apply to jobs, view/update profile, check payments |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register/driver` | Register as driver | - |
| POST | `/register/company` | Register as company | - |
| POST | `/login` | Login | - |
| POST | `/refresh` | Refresh access token | - |
| POST | `/logout` | Logout | - |
| GET | `/me` | Get current user | ✅ |

### Drivers (`/api/drivers`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List drivers (with filters) | - |
| GET | `/:id` | Get driver profile | - |
| GET | `/me/profile` | Own profile | Driver |
| PUT | `/me/profile` | Update profile | Driver |
| GET | `/me/stats` | Driver statistics | Driver |
| PUT | `/:id/verify` | Verify/reject driver | Admin |

### Jobs (`/api/jobs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List jobs (with filters) | - |
| GET | `/:id` | Job details | - |
| POST | `/` | Post new job | Company |
| PUT | `/:id` | Update job | Company/Admin |
| POST | `/:id/apply` | Apply to job | Driver |
| POST | `/:id/assign` | Assign driver | Admin |
| GET | `/company/mine` | Company's jobs | Company |

### Payments (`/api/payments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order` | Create payment order | Company |
| POST | `/verify` | Verify payment (webhook) | Company |
| GET | `/` | All payments | Admin |
| GET | `/my-payments` | Driver's payments | Driver |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | Any |
| PUT | `/:id/read` | Mark as read | Any |
| PUT | `/read-all` | Mark all as read | Any |
| POST | `/send` | Send notification | Admin |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard stats | Admin |
| GET | `/users` | All users | Admin |
| PUT | `/users/:id/status` | Suspend/activate | Admin |
| PUT | `/jobs/:id/approve` | Approve job | Admin |
| GET | `/analytics` | Platform analytics | Admin |

---

## 🗄️ Database Schema

### Tables
- **users** - Base authentication table (admin, driver, company)
- **drivers** - Driver profiles, machine types, verification status
- **companies** - Company profiles, GST, verification
- **jobs** - Job postings with requirements and budget
- **job_applications** - Driver applications to jobs
- **payments** - Payment transactions with Razorpay integration
- **notifications** - In-app notification system
- **reviews** - Ratings and reviews between companies and drivers
- **refresh_tokens** - JWT refresh token management
- **admins** - Admin user profiles

---

## 💳 Razorpay Integration

To enable payments:
1. Create a Razorpay account at https://razorpay.com
2. Get your test keys from the dashboard
3. Update `.env`:
```
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
```

Payment flow:
1. Company calls `POST /api/payments/create-order`
2. Frontend shows Razorpay payment modal
3. After payment, call `POST /api/payments/verify` with Razorpay callback data
4. Driver receives payment notification

---

## 📊 Sample Login Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@equipdriver.in | Admin@123456 |
| Driver | rajesh.kumar@driver.com | Driver@123 |
| Company | contact@buildtech.com | Company@123 |

---

## 🔧 Health Check

```
GET http://localhost:5000/api/health
```

Returns database connection status and server info.

---

## 📦 Security Features

- **Helmet**: Security HTTP headers
- **Rate Limiting**: 100 req/15min (10 for auth)
- **JWT**: Short-lived access + refresh token rotation
- **bcryptjs**: Password hashing with salt rounds 12
- **Input Validation**: express-validator on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Whitelist-based origin control
