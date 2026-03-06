const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists and is active
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, role, is_active')
            .eq('id', decoded.userId)
            .maybeSingle();

        if (error) throw error;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is no longer valid. User not found.'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is suspended. Please contact support.'
            });
        }

        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired.' });
        }
        logger.error('Authentication error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
