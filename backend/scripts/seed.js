const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with sample data via Supabase...');

        // Create Admin user
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
        const { data: adminUser, error: adminUserError } = await supabaseAdmin
            .from('users')
            .upsert({
                email: 'admin@equipdriver.in',
                password_hash: adminPasswordHash,
                role: 'admin',
                is_active: true,
                is_verified: true
            }, { onConflict: 'email' })
            .select('id')
            .single();

        if (adminUserError) throw adminUserError;

        const { error: adminProfileError } = await supabaseAdmin
            .from('admins')
            .upsert({
                user_id: adminUser.id,
                full_name: 'System Administrator',
                phone: '+91 98765 00000'
            }, { onConflict: 'user_id' });

        if (adminProfileError) throw adminProfileError;
        console.log('✅ Admin user created: admin@equipdriver.in / Admin@123456');

        // Create Driver users
        const drivers = [
            {
                email: 'rajesh.kumar@driver.com',
                full_name: 'Rajesh Kumar',
                phone: '+91 98765 43210',
                location: 'Mumbai, Maharashtra',
                state: 'Maharashtra',
                city: 'Mumbai',
                license_number: 'MH01-20160012345',
                machine_type: 'Excavator',
                experience_years: 8,
                verification_status: 'verified',
                rating: 4.8,
                total_jobs: 156
            },
            {
                email: 'amit.sharma@driver.com',
                full_name: 'Amit Sharma',
                phone: '+91 98765 43211',
                location: 'Delhi, NCR',
                state: 'Delhi',
                city: 'Delhi',
                license_number: 'DL01-20140023456',
                machine_type: 'JCB',
                experience_years: 12,
                verification_status: 'verified',
                rating: 4.9,
                total_jobs: 234
            },
            {
                email: 'suresh.patel@driver.com',
                full_name: 'Suresh Patel',
                phone: '+91 98765 43212',
                location: 'Pune, Maharashtra',
                state: 'Maharashtra',
                city: 'Pune',
                license_number: 'MH12-20180034567',
                machine_type: 'Hitachi',
                experience_years: 5,
                verification_status: 'pending',
                rating: 4.5,
                total_jobs: 67
            },
            {
                email: 'vikram.singh@driver.com',
                full_name: 'Vikram Singh',
                phone: '+91 98765 43213',
                location: 'Bangalore, Karnataka',
                state: 'Karnataka',
                city: 'Bangalore',
                license_number: 'KA01-20150045678',
                machine_type: 'Bulldozer',
                experience_years: 10,
                verification_status: 'verified',
                rating: 4.7,
                total_jobs: 189
            },
            {
                email: 'manoj.yadav@driver.com',
                full_name: 'Manoj Yadav',
                phone: '+91 98765 43214',
                location: 'Hyderabad, Telangana',
                state: 'Telangana',
                city: 'Hyderabad',
                license_number: 'TS01-20170056789',
                machine_type: 'Crane',
                experience_years: 6,
                verification_status: 'pending',
                rating: 4.6,
                total_jobs: 98
            }
        ];

        const driverPassword = await bcrypt.hash('Driver@123', 12);
        for (const driver of drivers) {
            const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .upsert({
                    email: driver.email,
                    password_hash: driverPassword,
                    role: 'driver',
                    is_active: true,
                    is_verified: driver.verification_status === 'verified'
                }, { onConflict: 'email' })
                .select('id')
                .single();

            if (userError) throw userError;

            const { error: profileError } = await supabaseAdmin
                .from('drivers')
                .upsert({
                    user_id: user.id,
                    full_name: driver.full_name,
                    phone: driver.phone,
                    location: driver.location,
                    state: driver.state,
                    city: driver.city,
                    license_number: driver.license_number,
                    machine_type: driver.machine_type,
                    experience_years: driver.experience_years,
                    verification_status: driver.verification_status,
                    rating: driver.rating,
                    total_jobs: driver.total_jobs
                }, { onConflict: 'user_id' });

            if (profileError) throw profileError;
        }
        console.log(`✅ ${drivers.length} drivers created`);

        // Create Company users
        const companies = [
            {
                email: 'contact@buildtech.com',
                company_name: 'BuildTech Pvt Ltd',
                contact_person: 'Rahul Mehta',
                phone: '+91 22-12345678',
                location: 'Mumbai, Maharashtra',
                state: 'Maharashtra',
                city: 'Mumbai',
                gst_number: '27AABCT1234A1Z5',
                verification_status: 'verified'
            },
            {
                email: 'hr@metroconstruction.com',
                company_name: 'Metro Construction Ltd',
                contact_person: 'Priya Sharma',
                phone: '+91 11-23456789',
                location: 'Delhi, NCR',
                state: 'Delhi',
                city: 'Delhi',
                gst_number: '07AABCM5678B1Z2',
                verification_status: 'verified'
            },
            {
                email: 'contact@highwaydevelopers.com',
                company_name: 'Highway Developers Pvt Ltd',
                contact_person: 'Sunil Kumar',
                phone: '+91 20-34567890',
                location: 'Pune, Maharashtra',
                state: 'Maharashtra',
                city: 'Pune',
                gst_number: '27AABCH9012C1Z8',
                verification_status: 'verified'
            },
            {
                email: 'admin@urbaninfrastructure.com',
                company_name: 'Urban Infrastructure Corp',
                contact_person: 'Anil Joshi',
                phone: '+91 80-45678901',
                location: 'Bangalore, Karnataka',
                state: 'Karnataka',
                city: 'Bangalore',
                gst_number: '29AABCU3456D1Z4',
                verification_status: 'pending'
            }
        ];

        const companyPassword = await bcrypt.hash('Company@123', 12);
        const companyIds = [];
        for (const company of companies) {
            const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .upsert({
                    email: company.email,
                    password_hash: companyPassword,
                    role: 'company',
                    is_active: true,
                    is_verified: company.verification_status === 'verified'
                }, { onConflict: 'email' })
                .select('id')
                .single();

            if (userError) throw userError;

            const { data: companyData, error: profileError } = await supabaseAdmin
                .from('companies')
                .upsert({
                    user_id: user.id,
                    company_name: company.company_name,
                    contact_person: company.contact_person,
                    phone: company.phone,
                    location: company.location,
                    state: company.state,
                    city: company.city,
                    gst_number: company.gst_number,
                    verification_status: company.verification_status,
                    total_jobs_posted: Math.floor(Math.random() * 50) + 5
                }, { onConflict: 'user_id' })
                .select('id')
                .single();

            if (profileError) throw profileError;
            if (companyData) companyIds.push(companyData.id);
        }
        console.log(`✅ ${companies.length} companies created`);

        // Create sample jobs
        if (companyIds.length >= 3) {
            const jobs = [
                {
                    company_id: companyIds[0],
                    machine_type: 'Excavator',
                    location: 'Andheri, Mumbai',
                    state: 'Maharashtra',
                    city: 'Mumbai',
                    duration: '3 Months',
                    budget_display: '₹30,000/month',
                    budget_min: 28000,
                    budget_max: 32000,
                    description: 'Need experienced excavator operator for commercial construction project. Site in Andheri West. Working hours 8am-6pm, Monday to Saturday.',
                    status: 'active',
                    accommodation_provided: false,
                    food_provided: true,
                    night_shifts: false,
                    transport_provided: false
                },
                {
                    company_id: companyIds[1],
                    machine_type: 'JCB',
                    location: 'Dwarka, Delhi',
                    state: 'Delhi',
                    city: 'Delhi',
                    duration: '6 Months',
                    budget_display: '₹35,000/month',
                    budget_min: 33000,
                    budget_max: 38000,
                    description: 'Metro rail construction project requires JCB operator with minimum 5 years experience. Safety certification mandatory.',
                    status: 'active',
                    accommodation_provided: true,
                    food_provided: true,
                    night_shifts: true,
                    transport_provided: false
                },
                {
                    company_id: companyIds[2],
                    machine_type: 'Hitachi',
                    location: 'Hadapsar, Pune',
                    state: 'Maharashtra',
                    city: 'Pune',
                    duration: '1 Month',
                    budget_display: '₹28,000/month',
                    budget_min: 26000,
                    budget_max: 30000,
                    description: 'Highway expansion project needs Hitachi operator. NHAI project with good working environment.',
                    status: 'pending',
                    accommodation_provided: false,
                    food_provided: false,
                    night_shifts: false,
                    transport_provided: true
                },
                {
                    company_id: companyIds.length >= 4 ? companyIds[3] : companyIds[0],
                    machine_type: 'Bulldozer',
                    location: 'Whitefield, Bangalore',
                    state: 'Karnataka',
                    city: 'Bangalore',
                    duration: '4 Months',
                    budget_display: '₹40,000/month',
                    budget_min: 38000,
                    budget_max: 45000,
                    description: 'Large residential township project. Need skilled bulldozer operator for land clearing and grading work.',
                    status: 'completed',
                    accommodation_provided: true,
                    food_provided: false,
                    night_shifts: false,
                    transport_provided: false
                }
            ];

            const { error: jobsError } = await supabaseAdmin
                .from('jobs')
                .insert(jobs);

            if (jobsError) throw jobsError;
            console.log(`✅ ${jobs.length} jobs created`);
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('👤 Admin:   admin@equipdriver.in / Admin@123456');
        console.log('🚗 Driver:  rajesh.kumar@driver.com / Driver@123');
        console.log('🏢 Company: contact@buildtech.com / Company@123');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
