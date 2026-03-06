const express = require('express');
const router = express.Router();
const {
    getAllCompanies,
    getCompanyById,
    getMyProfile,
    updateProfile,
    verifyCompany,
    getCompanyStats
} = require('../controllers/companiesController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// Company-only routes
router.get('/me/profile', authenticate, authorize('company'), getMyProfile);
router.put('/me/profile', authenticate, authorize('company'), updateProfile);
router.get('/me/stats', authenticate, authorize('company'), getCompanyStats);

// Admin-only routes
router.put('/:id/verify', authenticate, authorize('admin'), verifyCompany);

module.exports = router;
