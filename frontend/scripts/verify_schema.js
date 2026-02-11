
const { Client } = require('pg');

const connectionString = "postgresql://postgres.hmwaoxbluljfqmsytyjv:M1k1sB3ll.$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function verifySchema() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB. Checking columns for "proyectos"...');

        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'proyectos';
    `);

        console.log('Columns found:', res.rows.map(r => r.column_name).join(', '));

        const hasAmbito = res.rows.some(r => r.column_name === 'ambito');
        console.log('Has "ambito" column?', hasAmbito);

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await client.end();
    }
}

verifySchema();
