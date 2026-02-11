#!/usr/bin/env node
/**
 * Migration script — executes SQL against Supabase via pg-meta REST API
 * Usage: node run-migration.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read env from frontend/.env.local
const envPath = resolve(__dirname, '..', 'frontend', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
    envContent.split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => {
            const idx = l.indexOf('=')
            return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
        })
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY')
    process.exit(1)
}

// Read the main schema SQL
const schemaPath = resolve(__dirname, 'schema_supabase.sql')
const schemaSql = readFileSync(schemaPath, 'utf-8')

// Read fase10_planos migration
const fase10Path = resolve(__dirname, '..', 'frontend', 'src', 'lib', 'supabase', 'migrations', 'fase10_planos.sql')
let fase10Sql = ''
try {
    fase10Sql = readFileSync(fase10Path, 'utf-8')
} catch {
    console.log('⚠️  fase10_planos.sql not found, skipping')
}

async function executeSql(sql, label) {
    console.log(`\n🔄 Executing: ${label}...`)

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql_query: sql }),
    })

    if (res.ok) {
        console.log(`✅ ${label} — OK`)
        return true
    }

    // If rpc/exec_sql doesn't exist, try the pg-meta endpoint
    const errText = await res.text()
    console.log(`⚠️  rpc/exec_sql failed (${res.status}): ${errText.slice(0, 200)}`)
    return false
}

async function executeSqlViaPgMeta(sql, label) {
    console.log(`\n🔄 Executing via pg-meta: ${label}...`)

    // Supabase pg-meta query endpoint
    const res = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'x-connection-encrypted': 'true',
        },
        body: JSON.stringify({ query: sql }),
    })

    if (res.ok) {
        const data = await res.json()
        console.log(`✅ ${label} — OK`)
        return true
    }

    const errText = await res.text()
    console.log(`⚠️  pg-meta failed (${res.status}): ${errText.slice(0, 300)}`)
    return false
}

async function main() {
    console.log('🚀 HidroAliaga Database Migration')
    console.log(`📍 Target: ${SUPABASE_URL}`)
    console.log('─'.repeat(50))

    // Try rpc method first, fall back to pg-meta
    let success = await executeSql(schemaSql, 'schema_supabase.sql')

    if (!success) {
        // Try pg-meta endpoint
        success = await executeSqlViaPgMeta(schemaSql, 'schema_supabase.sql')
    }

    if (!success) {
        console.log('\n❌ Could not execute SQL via API.')
        console.log('📋 Printing SQL to console — copy and paste into Supabase SQL Editor:\n')
        console.log('='.repeat(60))
        console.log(schemaSql)
        if (fase10Sql) {
            console.log('\n-- FASE 10 MIGRATION --\n')
            console.log(fase10Sql)
        }
        console.log('='.repeat(60))
        console.log('\n👉 Go to: https://supabase.com/dashboard/project/hmwaoxbluljfqmsytyjv/sql/new')
        process.exit(1)
    }

    if (fase10Sql) {
        const ok2 = await executeSql(fase10Sql, 'fase10_planos.sql') || await executeSqlViaPgMeta(fase10Sql, 'fase10_planos.sql')
        if (!ok2) console.log('⚠️  fase10_planos.sql failed, run manually')
    }

    console.log('\n✨ Migration complete!')
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
