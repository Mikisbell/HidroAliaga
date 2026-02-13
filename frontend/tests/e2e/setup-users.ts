import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const TEST_USERS = [
    { email: 'admin@hidroaliaga.com', password: 'admin123', name: 'Admin' },
    { email: 'user_a@test.com', password: 'password123', name: 'Test User A' },
    { email: 'user_b@test.com', password: 'password123', name: 'Test User B' },
];

async function globalSetup() {
    console.log('🔧 Setting up E2E test users...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('⚠️  Missing Supabase credentials - skipping test user setup');
        console.warn('   Tests will rely on manually created users');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    for (const user of TEST_USERS) {
        try {
            // Check if user already exists
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const userExists = existingUsers?.users.some(u => u.email === user.email);

            if (userExists) {
                console.log(`✓ User ${user.email} already exists`);
                continue;
            }

            // Create user
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    name: user.name,
                    is_test_user: true
                }
            });

            if (error) {
                throw error;
            }

            console.log(`✓ Created user ${user.email}`);
        } catch (error) {
            console.error(`❌ Failed to create ${user.email}:`, error);
            // Don't fail - continue with other users
        }
    }

    console.log('✅ Test user setup complete');
}

export default globalSetup;
