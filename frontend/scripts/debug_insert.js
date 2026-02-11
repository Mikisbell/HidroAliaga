
const { createClient } = require('@supabase/supabase-js');

// Hardcoded from .env.local file view
const supabaseUrl = 'https://hmwaoxbluljfqmsytyjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtd2FveGJsdWxqZnFtc3l0eWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc1NDI3MywiZXhwIjoyMDg2MzMwMjczfQ.bR1TdGRcUpBVhY3cm14Kh_JlnRxyEDwDyeDPMo6wShY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing insert with Service Role Key...');

    const testData = {
        nombre: "Debug Project Full Payload " + Date.now(),
        descripcion: "Final verification of all columns",
        ambito: "urbano",
        tipo_red: "cerrada",
        departamento: "Test DPT",
        provincia: "Test PROV",
        distrito: "Test DIST",
        poblacion_diseno: 500,
        periodo_diseno: 20,
        dotacion_percapita: 169,
        coef_cobertura: 0.8,
        // Optional fields
        coef_hazen_williams: 150
    };

    try {
        // 1. Get a valid user to link
        console.log('Fetching a user to link...');
        const { data: listUser, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1 });

        if (listError) {
            console.error('Error listing users:', listError);
        } else if (listUser && listUser.users.length > 0) {
            const userId = listUser.users[0].id;
            console.log('Found user:', userId);
            testData.usuario_id = userId;
        }

        // 2. Perform Insert
        console.log('Inserting data:', JSON.stringify(testData));

        const { data, error } = await supabase
            .from('proyectos')
            .insert(testData)
            .select()
            .single();

        if (error) {
            console.error('Insert FAILED:', error.message);
            console.error('Error Code:', error.code);
            console.error('Full Error:', JSON.stringify(error));
        } else {
            console.log('Insert SUCCESS! Created project ID:', data.id);
            // console.log('The schema supports all sent fields.');

            // Cleanup
            await supabase.from('proyectos').delete().eq('id', data.id);
            // console.log('Cleaned up test record.');
        }

    } catch (e) {
        console.error('Unexpected script error:', e);
    }
}

testInsert();
