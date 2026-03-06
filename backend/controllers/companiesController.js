const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// GET /api/companies - List all companies (public)
const getAllCompanies = async (req, res, next) => {
    try {
        const {
            status, city, state,
            page = 1, limit = 10, search
        } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from('companies')
            .select(`
                id, company_name, contact_person, phone, location, state, city,
                gst_number, verification_status, rating, total_jobs_posted,
                logo_url, created_at, 
                users (email)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('verification_status', status);
        }
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        if (state) {
            query = query.ilike('state', `%${state}%`);
        }
        if (search) {
            query = query.or(`company_name.ilike.%${search}%,contact_person.ilike.%${search}%`);
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
                companies: data.map(c => ({ ...c, email: c.users?.email })),
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

// GET /api/companies/:id - Get company by ID
const getCompanyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*, users(email, created_at)')
            .eq('id', id)
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company not found.' });
            throw companyError;
        }

        // Get company's active jobs
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, machine_type, location, duration, budget_display, status, created_at')
            .eq('company_id', id)
            .in('status', ['active', 'assigned'])
            .order('created_at', { ascending: false })
            .limit(10);

        if (jobsError) throw jobsError;

        // Get total completed jobs and avg rating (calculated from jobs and reviews)
        const { data: allJobs, error: statsError } = await supabase
            .from('jobs')
            .select('id, status, reviews!inner(rating, reviewer_type)')
            .eq('company_id', id);

        // PGRST can't do complex aggregates easily via JS client, manual calc or RPC needed
        // For simplicity, we'll fetch all jobs with reviews or use count
        const { count: completedCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', id)
            .eq('status', 'completed');

        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', company.user_id)
            .eq('reviewer_type', 'driver');

        if (reviewsError) throw reviewsError;

        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            data: {
                company: {
                    ...company,
                    email: company.users?.email,
                    member_since: company.users?.created_at
                },
                active_jobs: jobs,
                stats: {
                    completed_jobs: completedCount || 0,
                    active_jobs: jobs.length,
                    avg_driver_rating: avgRating
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/companies/me/profile - Get current company's own profile
const getMyProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*, users(email)')
            .eq('user_id', userId)
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company profile not found.' });
            throw companyError;
        }

        // Get company's jobs with assigned drivers
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select(`
                id, machine_type, title, location, duration, budget_display,
                status, start_date, end_date, created_at,
                drivers(full_name, phone, rating)
            `)
            .eq('company_id', company.id)
            .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Get payment history
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, amount, status, for_month, payment_date, created_at, drivers(full_name)')
            .eq('company_id', company.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (paymentsError) throw paymentsError;

        // Stats calculation
        let active_jobs_count = 0;
        let completed_jobs_count = 0;
        const driverIds = new Set();
        let total_spent = 0;

        jobs.forEach(j => {
            if (['active', 'assigned'].includes(j.status)) active_jobs_count++;
            if (j.status === 'completed') completed_jobs_count++;
            if (j.assigned_driver_id) driverIds.add(j.assigned_driver_id);
        });

        const { data: completedPayments, error: cpError } = await supabase
            .from('payments')
            .select('amount')
            .eq('company_id', company.id)
            .eq('status', 'completed');

        if (cpError) throw cpError;
        total_spent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            success: true,
            data: {
                company: { ...company, email: company.users?.email },
                jobs: jobs.map(j => ({
                    ...j,
                    driver_name: j.drivers?.full_name,
                    driver_phone: j.drivers?.phone,
                    driver_rating: j.drivers?.rating
                })),
                payments: payments.map(p => ({
                    ...p,
                    driver_name: p.drivers?.full_name
                })),
                stats: {
                    active_jobs: active_jobs_count,
                    completed_jobs: completed_jobs_count,
                    total_hires: driverIds.size,
                    total_spent: total_spent / 100.0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/companies/me/profile - Update company profile
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const {
            company_name, contact_person, phone,
            location, state, city, gst_number
        } = req.body;

        const updates = {};
        if (company_name !== undefined) updates.company_name = company_name;
        if (contact_person !== undefined) updates.contact_person = contact_person;
        if (phone !== undefined) updates.phone = phone;
        if (location !== undefined) updates.location = location;
        if (state !== undefined) updates.state = state;
        if (city !== undefined) updates.city = city;
        if (gst_number !== undefined) updates.gst_number = gst_number;

        const { data, error } = await supabase
            .from('companies')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company profile not found.' });
            throw error;
        }

        res.json({
            success: true,
            message: 'Company profile updated successfully.',
            data: { company: data }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/companies/:id/verify (Admin only)
const verifyCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "verified" or "rejected".'
            });
        }

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .update({ verification_status: status })
            .eq('id', id)
            .select('id, company_name, verification_status, user_id')
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company not found.' });
            throw companyError;
        }

        // Update user verified status
        await supabase
            .from('users')
            .update({ is_verified: status === 'verified' })
            .eq('id', company.user_id);

        // Notify the company
        const notifMessage = status === 'verified'
            ? `Congratulations! ${company.company_name} has been verified. You can now post jobs and hire drivers.`
            : `Your company verification was rejected. Reason: ${rejection_reason || 'Not specified'}. Please update your details and try again.`;

        await supabase
            .from('notifications')
            .insert([{
                user_id: company.user_id,
                type: 'verification',
                title: `Company ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: notifMessage
            }]);

        logger.info(`Company ${id} ${status} by admin ${req.user.userId}`);

        res.json({
            success: true,
            message: `Company ${status} successfully.`,
            data: { company }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/companies/me/stats
const getCompanyStats = async (req, res, next) => {
    try {
        const { userId } = req.user;

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

        // Fetch jobs and payments for stats
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, status, assigned_driver_id')
            .eq('company_id', companyId);

        if (jobsError) throw jobsError;

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, status')
            .eq('company_id', companyId);

        if (paymentsError) throw paymentsError;

        let active_jobs = 0;
        let completed_jobs = 0;
        let pending_jobs = 0;
        const hires = new Set();
        let total_spent = 0;
        let pending_payments = 0;

        jobs.forEach(j => {
            if (['active', 'assigned'].includes(j.status)) active_jobs++;
            if (j.status === 'completed') completed_jobs++;
            if (j.status === 'pending') pending_jobs++;
            if (j.assigned_driver_id) hires.add(j.assigned_driver_id);
        });

        payments.forEach(p => {
            if (p.status === 'completed') total_spent += p.amount;
            if (p.status === 'pending') pending_payments += p.amount;
        });

        res.json({
            success: true,
            data: {
                stats: {
                    active_jobs,
                    completed_jobs,
                    pending_jobs,
                    total_hires: hires.size,
                    total_spent: total_spent / 100.0,
                    pending_payments: pending_payments / 100.0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCompanies,
    getCompanyById,
    getMyProfile,
    updateProfile,
    verifyCompany,
    getCompanyStats
};
