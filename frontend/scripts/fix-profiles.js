const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[match[1].trim()] = value;
        }
    });
    return env;
}

const envPath = path.resolve(__dirname, '../.env');
const env = loadEnv(envPath);

if (!env.DATABASE_URL) {
    const envLocal = loadEnv(path.resolve(__dirname, '../.env.local'));
    Object.assign(env, envLocal);
}

const client = new Client({
    connectionString: env.DATABASE_URL.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

async function fixProfiles() {
    try {
        await client.connect();
        console.log('Connected. Checking auth.users...');

        // 1. Get all users from auth.users
        const authUsersRes = await client.query(`
            SELECT id, email, raw_user_meta_data 
            FROM auth.users
        `);

        const authUsers = authUsersRes.rows;
        console.log(`Found ${authUsers.length} users in auth.users.`);

        for (const user of authUsers) {
            console.log(`Checking profile for user: ${user.email} (${user.id})`);

            // 2. Check if profile exists
            const profileRes = await client.query(`
                SELECT * FROM public.profiles WHERE id = $1
            `, [user.id]);

            if (profileRes.rows.length === 0) {
                console.log(`  -> Profile MISSING. Creating...`);

                const meta = user.raw_user_meta_data || {};
                const fullName = meta.full_name || meta.name || user.email.split('@')[0];
                const avatarUrl = meta.avatar_url || meta.picture || null;

                // 3. Create profile
                // By default 'user', but we can make the first one 'admin' if requested
                // For now, let's make EVERYONE 'admin' since user asked for it and it's dev env?
                // Or safely make just this one if it's the only one.

                let role = 'user';
                // Strategy: if it's the FIRST user in the system, make them ADMIN.
                if (authUsers.length === 1) {
                    role = 'admin';
                    console.log('  -> Only one user found. Granting ADMIN role.');
                }

                await client.query(`
                    INSERT INTO public.profiles (id, full_name, avatar_url, role)
                    VALUES ($1, $2, $3, $4)
                `, [user.id, fullName, avatarUrl, role]);

                console.log(`  -> Profile created with role: ${role}`);
            } else {
                console.log(`  -> Profile exists. Role: ${profileRes.rows[0].role}`);
                // If user wants to be admin and isn't:
                if (profileRes.rows[0].role !== 'admin') {
                    // Uncomment to force update:
                    // await client.query("UPDATE public.profiles SET role = 'admin' WHERE id = $1", [user.id]);
                    // console.log('  -> UPDATED to ADMIN.');
                }
            }
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

fixProfiles();
