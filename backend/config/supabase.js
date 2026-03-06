const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration. Please check your .env file.');
}

// Default client with Anon Key (for client-side/standard operations with RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with Service Role Key (for administrative operations that bypass RLS)
// USE WITH CAUTION: Only on server side!
const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

module.exports = { supabase, supabaseAdmin };
