require('dotenv').config({ path: '.env' });
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'MISSING');

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    console.log('\n--- Testing Supabase Connection ---');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables. Make sure .env is filled.');
        process.exit(1);
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    try {
        console.log('Attempting to fetch session/health...');
        // Try a simple select to check connectivity
        const { data, error, status, statusText } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Connection Error:', error);
            console.log('Status Code:', status);
            console.log('Status Text:', statusText);

            if (error.message === 'fetch failed') {
                console.log('\n💡 Tip: This often means the URL is unreachable or there is no internet connection.');
            } else if (status === 401 || status === 403) {
                console.log('\n💡 Tip: Your API key might be invalid.');
            } else if (status === 404) {
                console.log('\n💡 Tip: The "users" table might not exist yet. Run the schema.sql in Supabase SQL Editor.');
            }
            process.exit(1);
        } else {
            console.log('✅ Connection successful!');
            console.log('API responded with data:', data);
            process.exit(0);
        }
    } catch (e) {
        console.error('❌ Unexpected exception:', e);
        process.exit(1);
    }
}

testConnection();
