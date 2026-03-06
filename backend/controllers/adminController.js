const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// GET /api/admin/stats - Dashboard statistics
const getDashboardStats = async (req, res, next) => {
    try {
        // Fetch counts for drivers
        const { count: totalDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
        const { count: verifiedDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified');
        const { count: pendingDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending');

        // Fetch counts for jobs
        const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
        const { count: activeJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active');
        const { count: completedJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed');
        const { count: pendingJobsReview } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        // Fetch counts and sums for payments
        const { count: totalTransactions } = await supabase.from('payments').select('*', { count: 'exact', head: true });
        const { data: completedPayments } = await supabase.from('payments').select('amount').eq('status', 'completed');
        const { data: pendingPayments } = await supabase.from('payments').select('amount').eq('status', 'pending');

        const totalRevenue = (completedPayments || []).reduce((sum, p) => sum + p.amount, 0) / 100.0;
        const pendingAmount = (pendingPayments || []).reduce((sum, p) => sum + p.amount, 0) / 100.0;

        // Recent activity
        const { data: recentDrivers } = await supabase
            .from('drivers')
            .select('id, full_name, machine_type, verification_status, rating, created_at, users(email)')
            .order('created_at', { ascending: false })
            .limit(5);

        const { data: recentJobs } = await supabase
            .from('jobs')
            .select('id, machine_type, location, status, budget_display, created_at, companies(company_name)')
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            success: true,
            data: {
                stats: {
                    drivers: { total: totalDrivers, verified: verifiedDrivers, pending: pendingDrivers },
                    jobs: { total: totalJobs, active: activeJobs, completed: completedJobs, pending_review: pendingJobsReview },
                    payments: { total_transactions: totalTransactions, total_revenue: totalRevenue, pending_amount: pendingAmount }
                },
                recent: {
                    drivers: recentDrivers.map(d => ({ ...d, email: d.users?.email })),
                    jobs: recentJobs.map(j => ({ ...j, company_name: j.companies?.company_name }))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/users - Get all users (admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 10, status } = req.query;
        const fromIdx = (parseInt(page) - 1) * parseInt(limit);
        const toIdx = fromIdx + parseInt(limit) - 1;

        let query = supabase
            .from('users')
            .select('id, email, role, is_active, is_verified, last_login, created_at', { count: 'exact' });

        if (role) {
            query = query.eq('role', role);
        }
        if (status === 'active') {
            query = query.eq('is_active', true);
        } else if (status === 'inactive') {
            query = query.eq('is_active', false);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(fromIdx, toIdx);

        if (error) throw error;

        res.json({
            success: true,
            data: {
                users: data,
                pagination: {
                    total: count,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/users/:id/status - Suspend/activate user
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({ is_active })
            .eq('id', id)
            .select('id, email, role, is_active')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'User not found.' });
            throw error;
        }

        logger.info(`User ${id} status changed to ${is_active ? 'active' : 'suspended'} by admin ${req.user.userId}`);

        res.json({
            success: true,
            message: `User ${is_active ? 'activated' : 'suspended'} successfully.`,
            data: { user: data }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/jobs/:id/approve - Approve a job
const approveJob = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Update job status
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .update({ status: 'active' })
            .eq('id', id)
            .eq('status', 'pending')
            .select('*, companies(user_id)')
            .single();

        if (jobError) {
            if (jobError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Job not found or already approved.' });
            throw jobError;
        }

        const companyUserId = job.companies?.user_id;

        // Notify company
        if (companyUserId) {
            await supabase
                .from('notifications')
                .insert([{
                    user_id: companyUserId,
                    type: 'job',
                    title: 'Job Approved!',
                    message: 'Your job posting has been approved and is now live.'
                }]);
        }

        logger.info(`Job ${id} approved by admin ${req.user.userId}`);

        res.json({
            success: true,
            message: 'Job approved and now active.',
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/analytics - Get platform analytics
const getAnalytics = async (req, res, next) => {
    try {
        // Since PostgREST doesn't support complex aggregations/grouping like TO_CHAR in JS client directly,
        // we'll fetch data and process it. In production, an RPC or specialized view is better.

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Monthly Registrations
        const { data: usersData } = await supabase
            .from('users')
            .select('created_at')
            .gte('created_at', sixMonthsAgo.toISOString());

        const monthly_reg = {};
        (usersData || []).forEach(u => {
            const m = new Date(u.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthly_reg[m] = (monthly_reg[m] || 0) + 1;
        });

        const monthlyRegistrations = Object.keys(monthly_reg).map(month => ({ month, registrations: monthly_reg[month] }));

        // Jobs by Machine Type
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('machine_type');

        const type_counts = {};
        (jobsData || []).forEach(j => {
            type_counts[j.machine_type] = (type_counts[j.machine_type] || 0) + 1;
        });
        const jobsByMachineType = Object.keys(type_counts)
            .map(machine_type => ({ machine_type, count: type_counts[machine_type] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Payments by Month
        const { data: paymentsData } = await supabase
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', sixMonthsAgo.toISOString());

        const monthly_pay = {};
        (paymentsData || []).forEach(p => {
            const m = new Date(p.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthly_pay[m] = (monthly_pay[m] || 0) + (p.amount / 100.0);
        });
        const paymentsByMonth = Object.keys(monthly_pay).map(month => ({ month, total_amount: monthly_pay[month] }));

        // Top Drivers
        const { data: topDrivers } = await supabase
            .from('drivers')
            .select('full_name, rating, total_jobs, machine_type, location')
            .eq('verification_status', 'verified')
            .order('rating', { ascending: false })
            .order('total_jobs', { ascending: false })
            .limit(5);

        res.json({
            success: true,
            data: {
                monthly_registrations: monthlyRegistrations,
                jobs_by_machine_type: jobsByMachineType,
                payments_by_month: paymentsByMonth,
                top_drivers: topDrivers
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    approveJob,
    getAnalytics
};
