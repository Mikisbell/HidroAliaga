const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Variables de entorno faltantes.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteAdmin() {
    const targetEmail = 'admin@hidroaliaga.com';
    console.log(`--- Promoviendo a ${targetEmail} ---`);

    // 1. Buscar usuario
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.error('Usuario no encontrado');
        return;
    }

    // 2. Actualizar perfil
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error al actualizar:', updateError);
    } else {
        console.log(`✅ ÉXITO: Usuario ${targetEmail} ahora es ADMIN.`);
    }
}

promoteAdmin();
