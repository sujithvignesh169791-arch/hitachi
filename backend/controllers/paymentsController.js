const crypto = require('crypto');
const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// POST /api/payments/create-order - Create Razorpay order
const createPaymentOrder = async (req, res, next) => {
    try {
        const { job_id, driver_id, amount, for_month, description } = req.body;
        const { userId } = req.user;

        // Get company
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company not found.' });
            throw companyError;
        }

        const companyId = company.id;
        const amountInPaise = Math.round(amount * 100); // Convert to paise

        // In a real implementation, this would call the Razorpay API
        // For now, we create the payment record and simulate the order
        const razorpayOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert([{
                job_id,
                company_id: companyId,
                driver_id,
                amount: amountInPaise,
                status: 'pending',
                razorpay_order_id: razorpayOrderId,
                for_month: for_month || '',
                description: description || ''
            }])
            .select('id, razorpay_order_id, amount')
            .single();

        if (paymentError) throw paymentError;

        logger.info(`Payment order created: ${razorpayOrderId}`);

        res.json({
            success: true,
            message: 'Payment order created.',
            data: {
                orderId: razorpayOrderId,
                amount: amountInPaise,
                currency: 'INR',
                paymentId: payment.id,
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key'
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/payments/verify - Verify Razorpay payment
const verifyPayment = async (req, res, next) => {
    try {
        const {
            payment_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // In a real implementation, verify the Razorpay signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // For development, we skip actual signature verification
        const isValidSignature = process.env.NODE_ENV === 'production'
            ? expectedSignature === razorpay_signature
            : true;

        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Update payment record
        const { data: payment, error: updateError } = await supabase
            .from('payments')
            .update({
                status: 'completed',
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
                payment_date: new Date().toISOString().split('T')[0] // CURRENT_DATE equivalent
            })
            .eq('id', payment_id)
            .select('*, drivers(user_id)')
            .single();

        if (updateError) {
            if (updateError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Payment not found.' });
            throw updateError;
        }

        const driverUserId = payment.drivers?.user_id;

        // Notify driver
        if (driverUserId) {
            const amountStr = (payment.amount / 100).toLocaleString('en-IN');
            await supabase
                .from('notifications')
                .insert([{
                    user_id: driverUserId,
                    type: 'payment',
                    title: 'Payment Received!',
                    message: `₹${amountStr} payment received for ${payment.for_month}. Check your payment history.`
                }]);
        }

        logger.info(`Payment verified: ${razorpay_payment_id}`);

        res.json({
            success: true,
            message: 'Payment verified and processed successfully.',
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/payments - Get payment list (admin)
const getAllPayments = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const fromIdx = (parseInt(page) - 1) * parseInt(limit);
        const toIdx = fromIdx + parseInt(limit) - 1;

        let query = supabase
            .from('payments')
            .select(`
                id, amount, status, for_month, payment_date, created_at,
                razorpay_order_id, razorpay_payment_id,
                drivers(full_name),
                companies(company_name)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: payments, error, count } = await query
            .order('created_at', { ascending: false })
            .range(fromIdx, toIdx);

        if (error) throw error;

        // Summary calculation
        const { data: completedPayments, error: summaryError } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed');

        if (summaryError) throw summaryError;
        const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            success: true,
            data: {
                payments: payments.map(p => ({
                    ...p,
                    driver_name: p.drivers?.full_name,
                    company_name: p.companies?.company_name
                })),
                summary: {
                    total_count: count || 0,
                    total_amount: totalAmount / 100.0
                },
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    total: count || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/payments/driver - Get driver's payment history
const getDriverPayments = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (driverError) {
            if (driverError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Driver not found.' });
            throw driverError;
        }

        const driverId = driver.id;

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, amount, status, for_month, payment_date, created_at, companies(company_name)')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        // Summary calculation
        let totalEarned = 0;
        let paymentsReceived = 0;
        payments.forEach(p => {
            if (p.status === 'completed') {
                totalEarned += p.amount;
                paymentsReceived++;
            }
        });

        res.json({
            success: true,
            data: {
                payments: payments.map(p => ({
                    ...p,
                    amount: p.amount / 100.0,
                    company_name: p.companies?.company_name
                })),
                summary: {
                    total_earned: totalEarned / 100.0,
                    payments_received: paymentsReceived
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getAllPayments,
    getDriverPayments
};
