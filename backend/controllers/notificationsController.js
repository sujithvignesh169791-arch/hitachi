const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// GET /api/notifications - Get user's notifications
const getNotifications = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { page = 1, limit = 20, unread_only = false } = req.query;
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from('notifications')
            .select('id, type, title, message, is_read, action_url, metadata, created_at', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (unread_only === 'true') {
            query = query.eq('is_read', false);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Get unread count separately
        const { count: unreadCount, error: countError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (countError) throw countError;

        res.json({
            success: true,
            data: {
                notifications: data,
                unread_count: unreadCount || 0,
                total_count: count
            }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/notifications/:id/read - Mark notification as read
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/notifications/read-all - Mark all as read
const markAllAsRead = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const { data, error, count } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .select();

        if (error) throw error;

        res.json({
            success: true,
            message: `${data.length} notifications marked as read.`
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/notifications/send - Send notification (admin)
const sendNotification = async (req, res, next) => {
    try {
        const { user_id, type, title, message, action_url } = req.body;

        const { data, error } = await supabase
            .from('notifications')
            .insert([
                { user_id, type, title, message, action_url: action_url || null }
            ])
            .select()
            .single();

        if (error) throw error;

        logger.info(`Notification sent to user ${user_id} by admin ${req.user.userId}`);

        res.status(201).json({
            success: true,
            message: 'Notification sent.',
            data: { notification: data }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, sendNotification };
