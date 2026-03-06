const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    approveJob,
    getAnalytics
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(authenticate, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/jobs/:id/approve', approveJob);
router.get('/analytics', getAnalytics);

module.exports = router;
