const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification
} = require('../controllers/notificationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.post('/send', authenticate, authorize('admin'), sendNotification);

module.exports = router;
