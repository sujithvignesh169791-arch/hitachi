const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    registerDriver,
    registerCompany,
    login,
    refreshToken,
    logout,
    getMe
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Validation rules
const driverRegisterValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('phone').matches(/^\+?[1-9]\d{9,14}$/).withMessage('Valid phone number required'),
    body('location').trim().notEmpty().withMessage('Location required'),
    body('license_number').trim().notEmpty().withMessage('License number required'),
    body('machine_type').notEmpty().withMessage('Machine type required'),
    body('experience_years').isInt({ min: 0, max: 50 }).withMessage('Valid experience years required')
];

const companyRegisterValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('company_name').trim().notEmpty().withMessage('Company name required'),
    body('contact_person').trim().notEmpty().withMessage('Contact person required'),
    body('phone').matches(/^\+?[1-9]\d{9,14}$/).withMessage('Valid phone number required'),
    body('location').trim().notEmpty().withMessage('Location required')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
];

// Routes
router.post('/register/driver', driverRegisterValidation, registerDriver);
router.post('/register/company', companyRegisterValidation, registerCompany);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
