const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 1. Load Environment Variables
const envPath = path.join(__dirname, '../.env.local');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
            if (key && !key.startsWith('#')) env[key] = val;
        }
    });
} catch (e) {
    console.error("Error reading .env.local:", e.message);
    process.exit(1);
}

let connectionString = env.DATABASE_URL;
if (!connectionString) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
}

// Remove sslmode=require if present to allow manual override
connectionString = connectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');

async function main() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        // Fix path to point to root database folder (../../database)
        const sqlPath = path.join(__dirname, '../../database/add_reference_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing migration...");
        await client.query(sql);
        console.log("Migration successful.");

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
