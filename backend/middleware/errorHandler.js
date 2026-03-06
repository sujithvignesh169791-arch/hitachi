const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Validation errors (express-validator)
    if (err.type === 'validation') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors
        });
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Resource already exists. Duplicate entry.'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. Related resource not found.'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired.' });
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
        });
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found.`
    });
};

module.exports = { errorHandler, notFound };
