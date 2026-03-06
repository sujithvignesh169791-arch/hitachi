const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    applyToJob,
    assignDriver,
    getCompanyJobs
} = require('../controllers/jobsController');
const { authenticate, authorize } = require('../middleware/auth');

const createJobValidation = [
    body('machine_type').notEmpty().withMessage('Machine type required'),
    body('location').trim().notEmpty().withMessage('Location required'),
    body('duration').notEmpty().withMessage('Duration required'),
    body('budget_display').notEmpty().withMessage('Budget required'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
];

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Company routes
router.post('/', authenticate, authorize('company'), createJobValidation, createJob);
router.put('/:id', authenticate, authorize('company', 'admin'), updateJob);
router.get('/company/mine', authenticate, authorize('company'), getCompanyJobs);

// Driver routes
router.post('/:id/apply', authenticate, authorize('driver'), applyToJob);

// Admin routes
router.post('/:id/assign', authenticate, authorize('admin'), assignDriver);

module.exports = router;
