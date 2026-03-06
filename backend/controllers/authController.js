const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase');
const logger = require('../config/logger');

const generateTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const refreshToken = jwt.sign(
        { userId, role },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabase
        .from('refresh_tokens')
        .insert([{ user_id: userId, token: refreshToken, expires_at: expiresAt.toISOString() }]);

    if (error) {
        logger.error('Error storing refresh token', error);
        throw error;
    }
};

// POST /api/auth/register/driver
const registerDriver = async (req, res, next) => {
    try {
        const {
            email, password, full_name, phone, location, state, city,
            license_number, machine_type, experience_years
        } = req.body;

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Insert User
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ email, password_hash: passwordHash, role: 'driver', is_active: true, is_verified: false }])
            .select()
            .single();

        if (userError) throw userError;
        const userId = userData.id;

        // Insert Driver
        const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .insert([{
                user_id: userId, full_name, phone, location, state: state || '', city: city || '',
                license_number, machine_type, experience_years, verification_status: 'pending'
            }])
            .select()
            .single();

        if (driverError) {
            // Cleanup user if driver insert fails (manual rollback)
            await supabase.from('users').delete().eq('id', userId);
            throw driverError;
        }

        // Create welcome notification
        await supabase
            .from('notifications')
            .insert([{
                user_id: userId, type: 'info', title: 'Welcome to EquipDriver!',
                message: `Welcome ${full_name}! Your registration is under review. We'll notify you once verified.`
            }]);

        const { accessToken, refreshToken } = generateTokens(userId, 'driver');
        await storeRefreshToken(userId, refreshToken);

        logger.info(`New driver registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your application is under review.',
            data: {
                user: { id: userId, email, role: 'driver' },
                driver: { id: driverData.id, full_name, machine_type, verification_status: 'pending' },
                tokens: { accessToken, refreshToken }
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/register/company
const registerCompany = async (req, res, next) => {
    try {
        const {
            email, password, company_name, contact_person, phone,
            location, state, city, gst_number, registration_number
        } = req.body;

        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ email, password_hash: passwordHash, role: 'company', is_active: true, is_verified: false }])
            .select()
            .single();

        if (userError) throw userError;
        const userId = userData.id;

        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert([{
                user_id: userId, company_name, contact_person, phone, location,
                state: state || '', city: city || '', gst_number: gst_number || '',
                registration_number: registration_number || '', verification_status: 'pending'
            }])
            .select()
            .single();

        if (companyError) {
            await supabase.from('users').delete().eq('id', userId);
            throw companyError;
        }

        await supabase
            .from('notifications')
            .insert([{
                user_id: userId, type: 'info', title: 'Welcome to EquipDriver!',
                message: `Welcome ${company_name}! Your company registration is under review.`
            }]);

        const { accessToken, refreshToken } = generateTokens(userId, 'company');
        await storeRefreshToken(userId, refreshToken);

        logger.info(`New company registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Company registration successful! Under review.',
            data: {
                user: { id: userId, email, role: 'company' },
                company: { id: companyData.id, company_name, verification_status: 'pending' },
                tokens: { accessToken, refreshToken }
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, password_hash, role, is_active')
            .eq('email', email)
            .maybeSingle();

        if (userError) throw userError;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is suspended. Contact support.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Get profile data based on role
        let profileData = null;
        if (user.role === 'driver') {
            const { data, error } = await supabase
                .from('drivers')
                .select(`id, full_name, phone, location, machine_type, experience_years, 
                         verification_status, rating, total_jobs, is_available, profile_image_url`)
                .eq('user_id', user.id)
                .single();
            if (error) throw error;
            profileData = data;
        } else if (user.role === 'company') {
            const { data, error } = await supabase
                .from('companies')
                .select(`id, company_name, contact_person, phone, location, 
                         verification_status, rating, total_jobs_posted`)
                .eq('user_id', user.id)
                .single();
            if (error) throw error;
            profileData = data;
        } else if (user.role === 'admin') {
            const { data, error } = await supabase
                .from('admins')
                .select('id, full_name, phone')
                .eq('user_id', user.id)
                .single();
            if (error) throw error;
            profileData = data;
        }

        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        await storeRefreshToken(user.id, refreshToken);

        logger.info(`User logged in: ${email} (${user.role})`);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                profile: profileData,
                tokens: { accessToken, refreshToken }
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Refresh token required.' });
        }

        // Verify the refresh token exists and is valid in DB
        const { data: tokenRecord, error: tokenError } = await supabase
            .from('refresh_tokens')
            .select('user_id')
            .eq('token', token)
            .eq('is_revoked', false)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (tokenError) throw tokenError;
        if (!tokenRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        // Revoke old token
        await supabase
            .from('refresh_tokens')
            .update({ is_revoked: true })
            .eq('token', token);

        // Issue new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role);
        await storeRefreshToken(decoded.userId, newRefreshToken);

        res.json({
            success: true,
            data: { tokens: { accessToken, refreshToken: newRefreshToken } }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            await supabase
                .from('refresh_tokens')
                .update({ is_revoked: true })
                .eq('token', token);
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let profileData = null;

        if (role === 'driver') {
            const { data, error } = await supabase
                .from('drivers')
                .select('*, users(email)')
                .eq('user_id', userId)
                .single();
            if (error) throw error;
            profileData = data;
        } else if (role === 'company') {
            const { data, error } = await supabase
                .from('companies')
                .select('*, users(email)')
                .eq('user_id', userId)
                .single();
            if (error) throw error;
            profileData = data;
        } else if (role === 'admin') {
            const { data, error } = await supabase
                .from('admins')
                .select('*, users(email)')
                .eq('user_id', userId)
                .single();
            if (error) throw error;
            profileData = data;
        }

        res.json({
            success: true,
            data: {
                user: { id: userId, role },
                profile: profileData
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerDriver, registerCompany, login, refreshToken, logout, getMe };
