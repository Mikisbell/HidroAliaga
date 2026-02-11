
const { Client } = require('pg');

const connectionString = "postgresql://postgres.hmwaoxbluljfqmsytyjv:M1k1sB3ll.$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function fixPermissions() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected. Apply permissions fix...');

        // 1. Grant permissions
        console.log('Granting ALL on table proyectos...');
        await client.query(`
        GRANT ALL ON TABLE public.proyectos TO postgres, anon, authenticated, service_role;
    `);

        // 2. Refresh PostgREST cache
        console.log('Notifying pgrst to reload schema...');
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('Done!');
    } catch (err) {
        console.error('Failed:', err);
    } finally {
        await client.end();
    }
}

fixPermissions();
