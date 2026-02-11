const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAndVerify() {
    const targetEmail = 'admin@hidroaliaga.com';
    console.log(`Checking ${targetEmail}...`);

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === targetEmail);

    if (!user) { console.error('User not found'); return; }

    // Force update to admin
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    console.log('Role set to ADMIN.');

    // Verify
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    console.log('Current Role in DB:', data.role);
}

fixAndVerify();
