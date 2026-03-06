const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// GET /api/drivers - List all drivers (admin/company)
const getAllDrivers = async (req, res, next) => {
    try {
        const {
            status, machine_type, city, state,
            page = 1, limit = 10, search
        } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from('drivers')
            .select(`
                id, full_name, phone, location, state, city, machine_type,
                experience_years, verification_status, rating, total_jobs, is_available,
                profile_image_url, created_at, 
                users (email)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('verification_status', status);
        }
        if (machine_type) {
            query = query.eq('machine_type', machine_type);
        }
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        if (state) {
            query = query.ilike('state', `%${state}%`);
        }
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const total = count || 0;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: {
                drivers: data.map(d => ({ ...d, email: d.users?.email })),
                pagination: {
                    total,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/drivers/:id - Get driver by ID
const getDriverById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('*, users(email, created_at)')
            .eq('id', id)
            .single();

        if (driverError) {
            if (driverError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Driver not found.' });
            throw driverError;
        }

        // Get driver's work history (completed jobs)
        const { data: workHistory, error: workError } = await supabase
            .from('jobs')
            .select('id, machine_type, location, duration, budget_display, created_at, status, companies(company_name)')
            .eq('assigned_driver_id', id)
            .eq('status', 'completed')
            .order('updated_at', { ascending: false })
            .limit(10);

        if (workError) throw workError;

        res.json({
            success: true,
            data: {
                driver: {
                    ...driver,
                    email: driver.users?.email,
                    member_since: driver.users?.created_at
                },
                work_history: workHistory.map(j => ({ ...j, company_name: j.companies?.company_name }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/drivers/me - Get current driver profile
const getMyProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('*, users(email)')
            .eq('user_id', userId)
            .single();

        if (driverError) {
            if (driverError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Driver profile not found.' });
            throw driverError;
        }

        // Get jobs (assigned, active, completed)
        const { data: allJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, machine_type, location, duration, budget_display, status, start_date, updated_at, companies(company_name)')
            .eq('assigned_driver_id', driver.id)
            .in('status', ['assigned', 'active', 'completed'])
            .order('updated_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Get payment history
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, amount, status, for_month, payment_date, created_at, companies(company_name)')
            .eq('driver_id', driver.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (paymentsError) throw paymentsError;

        // Get applied jobs (applications)
        const { data: applications, error: appsError } = await supabase
            .from('job_applications')
            .select(`
                id, status, applied_at, cover_note,
                jobs (id, machine_type, location, duration, budget_display, status, companies(company_name))
            `)
            .eq('driver_id', driver.id)
            .order('applied_at', { ascending: false });

        if (appsError) throw appsError;

        res.json({
            success: true,
            data: {
                driver: { ...driver, email: driver.users?.email },
                assigned_jobs: allJobs
                    .filter(j => ['assigned', 'active'].includes(j.status))
                    .map(j => ({ ...j, company_name: j.companies?.company_name })),
                applied_jobs: applications.map(a => ({
                    ...a,
                    job: { ...a.jobs, company_name: a.jobs.companies?.company_name }
                })),
                work_history: allJobs
                    .filter(j => j.status === 'completed')
                    .map(j => ({ ...j, company_name: j.companies?.company_name })),
                payments: payments.map(p => ({ ...p, company_name: p.companies?.company_name }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/drivers/me - Update driver profile
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { phone, location, state, city, machine_type, is_available, bio } = req.body;

        const updates = {};
        if (phone !== undefined) updates.phone = phone;
        if (location !== undefined) updates.location = location;
        if (state !== undefined) updates.state = state;
        if (city !== undefined) updates.city = city;
        if (machine_type !== undefined) updates.machine_type = machine_type;
        if (is_available !== undefined) updates.is_available = is_available;
        if (bio !== undefined) updates.bio = bio;

        const { data, error } = await supabase
            .from('drivers')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: { driver: data }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/drivers/:id/verify (Admin only)
const verifyDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "verified" or "rejected".'
            });
        }

        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .update({
                verification_status: status,
                rejection_reason: rejection_reason || null
            })
            .eq('id', id)
            .select('id, full_name, verification_status, user_id')
            .single();

        if (driverError) {
            if (driverError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Driver not found.' });
            throw driverError;
        }

        // Update user verified status
        await supabase
            .from('users')
            .update({ is_verified: status === 'verified' })
            .eq('id', driver.user_id);

        // Create notification for driver
        const notifMessage = status === 'verified'
            ? `Congratulations! Your profile has been verified. You can now receive job offers.`
            : `Your profile verification was rejected. Reason: ${rejection_reason || 'Not specified'}. You may resubmit after updates.`;

        await supabase
            .from('notifications')
            .insert([{
                user_id: driver.user_id,
                type: 'verification',
                title: `Profile ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: notifMessage
            }]);

        logger.info(`Driver ${id} ${status} by admin ${req.user.userId}`);

        res.json({
            success: true,
            message: `Driver ${status} successfully.`,
            data: { driver }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/drivers/:id/stats
const getDriverStats = async (req, res, next) => {
    try {
        let driverId = req.params.id;

        if (!driverId) {
            const { data, error } = await supabase
                .from('drivers')
                .select('id')
                .eq('user_id', req.user.userId)
                .single();
            if (error) throw error;
            driverId = data.id;
        }

        const { data: jobs, error: statsError } = await supabase
            .from('jobs')
            .select('id, status, payments(amount, status)')
            .eq('assigned_driver_id', driverId);

        if (statsError) throw statsError;

        let active_jobs = 0;
        let completed_jobs = 0;
        let total_earnings = 0;

        jobs.forEach(job => {
            if (['assigned', 'active'].includes(job.status)) active_jobs++;
            if (job.status === 'completed') completed_jobs++;

            // Sum completed payments for this driver
            if (job.payments) {
                const jobPayments = Array.isArray(job.payments) ? job.payments : [job.payments];
                jobPayments.forEach(p => {
                    if (p.status === 'completed') {
                        total_earnings += p.amount;
                    }
                });
            }
        });

        res.json({
            success: true,
            data: {
                stats: {
                    active_jobs,
                    completed_jobs,
                    total_earnings: total_earnings / 100.0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    getMyProfile,
    updateProfile,
    verifyDriver,
    getDriverStats
};
