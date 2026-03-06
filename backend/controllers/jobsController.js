const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

// GET /api/jobs - List all jobs
const getAllJobs = async (req, res, next) => {
    try {
        const {
            status, machine_type, city, state,
            page = 1, limit = 10, search
        } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from('jobs')
            .select(`
                id, machine_type, location, state, city, duration,
                budget_display, budget_min, budget_max, status, description,
                accommodation_provided, food_provided, night_shifts, transport_provided,
                start_date, created_at, views_count,
                companies (company_name, location, logo_url)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
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
            query = query.or(`machine_type.ilike.%${search}%,location.ilike.%${search}%,companies.company_name.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const total = count || 0;

        res.json({
            success: true,
            data: {
                jobs: data.map(j => ({
                    ...j,
                    company_name: j.companies?.company_name,
                    company_location: j.companies?.location,
                    company_logo: j.companies?.logo_url
                })),
                pagination: {
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/jobs/:id
const getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch current job for view count increment (not atomic in JS client without RPC)
        const { data: currentJob, error: fetchError } = await supabase
            .from('jobs')
            .select('views_count')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Job not found.' });
            throw fetchError;
        }

        // Increment view count
        await supabase
            .from('jobs')
            .update({ views_count: (currentJob.views_count || 0) + 1 })
            .eq('id', id);

        const { data: job, error } = await supabase
            .from('jobs')
            .select(`
                *,
                companies (
                    company_name, contact_person, phone,
                    location, rating,
                    total_jobs_posted, logo_url
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Get applications count
        const { count: appCount, error: countError } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', id);

        if (countError) throw countError;

        res.json({
            success: true,
            data: {
                job: {
                    ...job,
                    company_name: job.companies?.company_name,
                    contact_person: job.companies?.contact_person,
                    company_phone: job.companies?.phone,
                    company_location: job.companies?.location,
                    company_rating: job.companies?.rating,
                    total_jobs_posted: job.companies?.total_jobs_posted,
                    company_logo: job.companies?.logo_url,
                    applications_count: appCount || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/jobs - Create a new job (company only)
const createJob = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const {
            machine_type, location, state, city, duration,
            budget_display, budget_min, budget_max, description,
            accommodation_provided, food_provided, night_shifts, transport_provided,
            start_date
        } = req.body;

        // Get company ID
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, verification_status, total_jobs_posted')
            .eq('user_id', userId)
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company profile not found.' });
            throw companyError;
        }

        if (company.verification_status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Company must be verified before posting jobs.'
            });
        }

        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert([{
                company_id: company.id, machine_type, location, state: state || '', city: city || '', duration,
                budget_display, budget_min: budget_min || null, budget_max: budget_max || null, description, status: 'pending',
                accommodation_provided: accommodation_provided || false, food_provided: food_provided || false,
                night_shifts: night_shifts || false, transport_provided: transport_provided || false,
                start_date: start_date || null
            }])
            .select()
            .single();

        if (jobError) throw jobError;

        // Update company job count
        await supabase
            .from('companies')
            .update({ total_jobs_posted: (company.total_jobs_posted || 0) + 1 })
            .eq('id', company.id);

        logger.info(`New job posted by company ${company.id}`);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully! Under admin review.',
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/jobs/:id - Update job (company)
const updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const body = req.body;

        // Verify ownership (or admin)
        const { data: jobData, error: ownerError } = await supabase
            .from('jobs')
            .select('company_id, companies!inner(user_id)')
            .eq('id', id)
            .single();

        if (ownerError) {
            if (ownerError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Job not found.' });
            throw ownerError;
        }

        if (jobData.companies.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this job.'
            });
        }

        const updates = {};
        const fields = ['machine_type', 'location', 'duration', 'budget_display', 'description', 'status'];
        fields.forEach(f => {
            if (body[f] !== undefined) updates[f] = body[f];
        });

        const { data: updatedJob, error: updateError } = await supabase
            .from('jobs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Job updated successfully.',
            data: { job: updatedJob }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/jobs/:id/apply - Driver applies to job
const applyToJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { cover_note } = req.body;

        // Get driver
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id, verification_status')
            .eq('user_id', userId)
            .single();

        if (driverError) {
            if (driverError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Driver profile not found.' });
            throw driverError;
        }

        if (driver.verification_status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Your profile must be verified before applying to jobs.'
            });
        }

        // Check job exists and is active
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id, status, company_id')
            .eq('id', id)
            .single();

        if (jobError) {
            if (jobError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Job not found.' });
            throw jobError;
        }

        if (job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This job is not currently accepting applications.'
            });
        }

        // Upsert application
        const { data: application, error: appError } = await supabase
            .from('job_applications')
            .upsert({ job_id: id, driver_id: driver.id, cover_note: cover_note || '' }, { onConflict: 'job_id, driver_id' })
            .select()
            .single();

        if (appError) throw appError;

        // Notify company
        const { data: companyUser, error: companyUserError } = await supabase
            .from('companies')
            .select('user_id')
            .eq('id', job.company_id)
            .single();

        if (companyUser) {
            await supabase
                .from('notifications')
                .insert([{
                    user_id: companyUser.user_id,
                    type: 'job',
                    title: 'New Application Received',
                    message: `A driver has applied to your job posting. Review their profile in the dashboard.`
                }]);
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            data: { application }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/jobs/:id/assign - Admin assigns driver to job
const assignDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { driver_id } = req.body;

        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .update({ assigned_driver_id: driver_id, status: 'assigned' })
            .eq('id', id)
            .select()
            .single();

        if (jobError) {
            if (jobError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Job not found.' });
            throw jobError;
        }

        // Update application statuses
        await supabase
            .from('job_applications')
            .update({ status: 'accepted' })
            .eq('job_id', id)
            .eq('driver_id', driver_id);

        await supabase
            .from('job_applications')
            .update({ status: 'rejected' })
            .eq('job_id', id)
            .neq('driver_id', driver_id)
            .eq('status', 'applied');

        // Notify driver
        const { data: driver, error: dError } = await supabase
            .from('drivers')
            .select('user_id, total_jobs')
            .eq('id', driver_id)
            .single();

        if (driver) {
            await supabase
                .from('notifications')
                .insert([{
                    user_id: driver.user_id,
                    type: 'job',
                    title: 'Job Assigned!',
                    message: 'You have been assigned to a new job. Check your dashboard for details.'
                }]);

            // Update driver job count
            await supabase
                .from('drivers')
                .update({ total_jobs: (driver.total_jobs || 0) + 1 })
                .eq('id', driver_id);
        }

        logger.info(`Job ${id} assigned to driver ${driver_id}`);

        res.json({
            success: true,
            message: 'Driver assigned successfully.',
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/jobs/company/mine - Get company's own jobs
const getCompanyJobs = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { status, page = 1, limit = 10 } = req.query;

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (companyError) {
            if (companyError.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Company not found.' });
            throw companyError;
        }

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from('jobs')
            .select(`
                *,
                drivers(full_name)
            `, { count: 'exact' })
            .eq('company_id', company.id);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: jobs, error: jobsError, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (jobsError) throw jobsError;

        // Fetch application counts for each job (manual as PGRST can't group join well in one go)
        const jobsWithApps = await Promise.all(jobs.map(async j => {
            const { count: appCount } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', j.id);

            return {
                ...j,
                applications_count: appCount || 0,
                assigned_driver_name: j.drivers?.full_name
            };
        }));

        res.json({
            success: true,
            data: {
                jobs: jobsWithApps,
                total: count || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    applyToJob,
    assignDriver,
    getCompanyJobs
};
