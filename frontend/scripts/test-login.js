const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://hmwaoxbluljfqmsytyjv.supabase.co',
    'sb_publishable_KlknSlm-QaLi7cM0cXEQnA_xwcNMHuC'
);

async function testLogin() {
    console.log('Testing login with admin@hidroaliaga.com...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@hidroaliaga.com',
        password: 'admin123'
    });

    if (error) {
        console.error('LOGIN FAILED:', error.message);
        console.error('Error code:', error.status);
        return;
    }

    console.log('LOGIN SUCCESS!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session:', !!data.session);
}

testLogin().catch(console.error);
