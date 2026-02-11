import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = new pg.Client({
    host: 'db.hmwaoxbluljfqmsytyjv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'M1k1sB3ll.$',
    ssl: { rejectUnauthorized: false }
})

async function run() {
    console.log('🔌 Conectando a Supabase Cloud...')
    await client.connect()
    console.log('✅ Conectado!\n')

    // 1. Schema principal
    const schema = readFileSync(resolve(__dirname, 'schema_supabase.sql'), 'utf-8')
    console.log('🔄 Ejecutando schema_supabase.sql...')
    await client.query(schema)
    console.log('✅ Schema principal creado!\n')

    // 2. Fase 10 - Planos
    try {
        const fase10 = readFileSync(resolve(__dirname, '..', 'frontend', 'src', 'lib', 'supabase', 'migrations', 'fase10_planos.sql'), 'utf-8')
        console.log('🔄 Ejecutando fase10_planos.sql...')
        await client.query(fase10)
        console.log('✅ Fase 10 aplicada!\n')
    } catch (e) {
        console.log('⚠️  fase10:', e.message)
    }

    // Verificar tablas
    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
    console.log('📋 Tablas creadas:')
    res.rows.forEach(r => console.log(`   ✓ ${r.tablename}`))

    await client.end()
    console.log('\n✨ Migración completada!')
}

run().catch(err => { console.error('❌ Error:', err.message); client.end(); process.exit(1) })
