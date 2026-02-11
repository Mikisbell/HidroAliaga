const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Variables de entorno faltantes.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
    console.log('--- Verificando Roles de Usuarios ---');

    // 1. Listar usuarios de auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    // 2. Listar perfiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
    }

    console.log(`Total Auth Users: ${users.length}`);
    console.log(`Total Profiles: ${profiles.length}`);

    console.log('\n--- Detalle ---');
    users.forEach(u => {
        const profile = profiles.find(p => p.id === u.id);
        console.log(`Email: ${u.email}`);
        console.log(`ID: ${u.id}`);
        console.log(`Provider: ${u.app_metadata.provider}`);
        console.log(`Profile Role: ${profile ? profile.role : 'NO PROFILE FOUND'}`);
        console.log('-------------------------');
    });
}

checkRoles();
