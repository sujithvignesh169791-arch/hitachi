const express = require('express');
const router = express.Router();
const {
    getAllDrivers,
    getDriverById,
    getMyProfile,
    updateProfile,
    verifyDriver,
    getDriverStats
} = require('../controllers/driversController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);

// Driver-only routes
router.get('/me/profile', authenticate, authorize('driver'), getMyProfile);
router.put('/me/profile', authenticate, authorize('driver'), updateProfile);
router.get('/me/stats', authenticate, authorize('driver'), getDriverStats);

// Admin-only routes
router.put('/:id/verify', authenticate, authorize('admin'), verifyDriver);

module.exports = router;
