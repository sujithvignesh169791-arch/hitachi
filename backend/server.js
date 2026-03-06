require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const driversRoutes = require('./routes/drivers');
const jobsRoutes = require('./routes/jobs');
const paymentsRoutes = require('./routes/payments');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const companiesRoutes = require('./routes/companies');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Create uploads and logs directories
// ==========================================
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
const logsDir = path.join(__dirname, 'logs');
[uploadsDir, logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ==========================================
// Security Middleware
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // Only 10 login/register attempts per 15 min
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// CORS Configuration
// ==========================================
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5174'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// ==========================================
// General Middleware
// ==========================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request logging
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Static files (uploaded documents)
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companiesRoutes);

// ==========================================
// Health Check
// ==========================================
app.get('/api/health', async (req, res) => {
    const { supabase } = require('./config/supabase');
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;

        res.json({
            success: true,
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'connected (Supabase)'
        });
    } catch (dbError) {
        res.status(503).json({
            success: false,
            status: 'Service Unavailable',
            database: 'disconnected',
            error: dbError.message
        });
    }
});

// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        name: 'EquipDriver API',
        version: '1.0.0',
        description: 'Heavy Equipment Driver Marketplace API for India',
        endpoints: {
            auth: {
                'POST /api/auth/register/driver': 'Register as a driver',
                'POST /api/auth/register/company': 'Register as a company',
                'POST /api/auth/login': 'Login for all users',
                'POST /api/auth/refresh': 'Refresh access token',
                'POST /api/auth/logout': 'Logout',
                'GET /api/auth/me': 'Get current user profile'
            },
            drivers: {
                'GET /api/drivers': 'List all drivers',
                'GET /api/drivers/:id': 'Get driver by ID',
                'GET /api/drivers/me/profile': 'Get own profile (Driver)',
                'PUT /api/drivers/me/profile': 'Update own profile (Driver)',
                'PUT /api/drivers/:id/verify': 'Verify driver (Admin)'
            },
            jobs: {
                'GET /api/jobs': 'List all jobs',
                'GET /api/jobs/:id': 'Get job by ID',
                'POST /api/jobs': 'Post a new job (Company)',
                'POST /api/jobs/:id/apply': 'Apply to job (Driver)',
                'POST /api/jobs/:id/assign': 'Assign driver to job (Admin)',
                'GET /api/jobs/company/mine': 'Get company\'s jobs (Company)'
            },
            payments: {
                'POST /api/payments/create-order': 'Create payment order (Company)',
                'POST /api/payments/verify': 'Verify Razorpay payment (Company)',
                'GET /api/payments': 'List all payments (Admin)',
                'GET /api/payments/my-payments': 'Get own payments (Driver)'
            },
            notifications: {
                'GET /api/notifications': 'Get notifications',
                'PUT /api/notifications/:id/read': 'Mark notification as read',
                'PUT /api/notifications/read-all': 'Mark all as read',
                'POST /api/notifications/send': 'Send notification (Admin)'
            },
            admin: {
                'GET /api/admin/stats': 'Dashboard statistics',
                'GET /api/admin/users': 'List all users',
                'PUT /api/admin/users/:id/status': 'Update user status',
                'PUT /api/admin/jobs/:id/approve': 'Approve job posting',
                'GET /api/admin/analytics': 'Platform analytics'
            }
        }
    });
});

// ==========================================
// Error Handling (must be last)
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================
const server = app.listen(PORT, () => {
    logger.info(`
  ╔══════════════════════════════════════════╗
  ║     EquipDriver Backend API Server       ║
  ╠══════════════════════════════════════════╣
  ║  Port      : ${PORT.toString().padEnd(28)}║
  ║  Env       : ${(process.env.NODE_ENV || 'development').padEnd(28)}║
  ║  API Docs  : http://localhost:${PORT}/api${' '.repeat(10)}║
  ║  Health    : http://localhost:${PORT}/api/health${' '.repeat(5)}║
  ╚══════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled promise rejection (server keeps running):', err?.message || err);
    // Don't crash the server - database may not be available in dev
});

module.exports = app;
