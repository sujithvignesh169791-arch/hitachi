const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPayment,
    getAllPayments,
    getDriverPayments
} = require('../controllers/paymentsController');
const { authenticate, authorize } = require('../middleware/auth');

// Company - create payment order
router.post('/create-order', authenticate, authorize('company'), createPaymentOrder);

// Verify payment after Razorpay callback
router.post('/verify', authenticate, authorize('company'), verifyPayment);

// Admin - view all payments
router.get('/', authenticate, authorize('admin'), getAllPayments);

// Driver - view own payments
router.get('/my-payments', authenticate, authorize('driver'), getDriverPayments);

module.exports = router;
