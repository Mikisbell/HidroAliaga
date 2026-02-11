const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://hmwaoxbluljfqmsytyjv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtd2FveGJsdWxqZnFtc3l0eWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc1NDI3MywiZXhwIjoyMDg2MzMwMjczfQ.bR1TdGRcUpBVhY3cm14Kh_JlnRxyEDwDyeDPMo6wShY'
);

async function ensureTestUser() {
    const email = 'admin@hidroaliaga.com';
    const password = 'admin123';

    // Check if user exists
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const existing = users?.users?.find(u => u.email === email);

    if (existing) {
        console.log(`✓ User ${email} already exists (id: ${existing.id})`);

        // Ensure profile has admin role
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: existing.id,
                email: email,
                role: 'admin',
                full_name: 'Admin Test'
            }, { onConflict: 'id' });

        if (profileError) {
            console.log('Profile upsert note:', profileError.message);
        } else {
            console.log('✓ Profile set to admin role');
        }
        return;
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin Test' }
    });

    if (error) {
        console.error('✗ Failed to create user:', error.message);
        return;
    }

    console.log(`✓ Created user ${email} (id: ${data.user.id})`);

    // Set admin role in profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: data.user.id,
            email: email,
            role: 'admin',
            full_name: 'Admin Test'
        }, { onConflict: 'id' });

    if (profileError) {
        console.log('Profile upsert note:', profileError.message);
    } else {
        console.log('✓ Profile set to admin role');
    }
}

ensureTestUser().catch(console.error);
