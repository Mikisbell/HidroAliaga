const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTriggers() {
    console.log('--- Inspecting Triggers on public.profiles ---');

    // We can't easily run SQL via JS client without a function, 
    // but we can try checking if the profile matches our expectation immediately after update.

    // 1. Promote to Admin
    const email = 'admin@hidroaliaga.com';
    console.log(`Promoting ${email}...`);

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) { console.error('User not found'); return; }

    await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);

    // 2. Read back immediately
    const { data: p1 } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log('Immediate read:', p1.role);

    // 3. Wait 5 seconds
    console.log('Waiting 5s...');
    await new Promise(r => setTimeout(r, 5000));

    // 4. Read again
    const { data: p2 } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log('Read after 5s:', p2.role);

    // 5. Simulate "login" or "update" event if possible? 
    // Maybe update another field and see if role keeps?
    console.log('Updating avatar_url...');
    await supabase.from('profiles').update({ avatar_url: 'test' }).eq('id', user.id);

    const { data: p3 } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log('Read after other update:', p3.role);

}

inspectTriggers();
