import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const TEST_USERS = [
    { email: 'admin@hidroaliaga.com', password: 'admin123', name: 'Admin', id: '11111111-1111-1111-1111-111111111111' },
    { email: 'user_a@test.com', password: 'password123', name: 'Test User A', id: '22222222-2222-2222-2222-222222222222' },
    { email: 'user_b@test.com', password: 'password123', name: 'Test User B', id: '33333333-3333-3333-3333-333333333333' },
];

const TEST_PROJECT_ID = 'aaaa1111-1111-1111-1111-111111111111';

async function globalSetup() {
    console.log('🔧 Setting up E2E test users...');

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn('⚠️  Missing Supabase credentials - skipping test user setup');
            console.warn('   Tests will rely on manually created users');
            return;
        }

        const supabase = createClient(
            supabaseUrl,
            supabaseServiceKey
        );

        console.log('🔧 Setting up E2E test users...');

        for (const user of TEST_USERS) {
            // Check if user exists
            const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) throw new Error(`Failed to list users: ${listError.message}`);

            const userExists = existingUsers?.users.some(u => u.email === user.email);

            // Start fresh - cleanup existing user to ensure we can set the specific ID
            if (userExists) {
                const existingUser = existingUsers?.users.find(u => u.email === user.email);
                if (existingUser) {
                    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
                    if (deleteError) throw new Error(`Failed to delete user ${user.email}: ${deleteError.message}`);
                    console.log(`♻️  Deleted existing user ${user.email}`);
                }
            }

            // Create user
            console.log(`Creating user ${user.email} with ID ${user.id}...`);
            const { data, error } = await supabase.auth.admin.createUser({
                id: user.id, // Explicit ID for deterministic testing
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    name: user.name,
                    is_test_user: true
                }
            });

            if (error) {
                console.error(`❌ Failed to create user ${user.email}:`, error);
                throw new Error(`Failed to create user: ${error.message}`);
            }

            console.log(`✅ User ${user.email} created/ready`);
        }

        // Create a default project for Admin to use in Designer tests
        // This avoids the slow UI creation flow in every test
        const adminId = TEST_USERS[0].id; // admin is the first entry
        if (adminId) {
            console.log('🏗️  Setting up default project for Admin...');

            // Cleanup existing project if any
            await supabase.from('proyectos').delete().eq('id', TEST_PROJECT_ID);

            const { error: projectError } = await supabase.from('proyectos').insert({
                id: TEST_PROJECT_ID,
                usuario_id: adminId,
                nombre: 'E2E Designer Test Project',
                descripcion: 'Project pre-created for E2E tests',
                departamento: 'Test Dept',
                provincia: 'Test Prov',
                distrito: 'Test Dist',
                poblacion_diseno: 1000,
                configuracion_plano: {},
                updated_at: new Date().toISOString()
            });

            if (projectError) {
                console.error('❌ Failed to create default project:', projectError);
                // Don't fail hard, tests might create their own
            } else {
                console.log(`✅ Default project created (${TEST_PROJECT_ID})`);
            }
        }

        console.log('✅ Test user setup complete');
    } catch (error) {
        console.error('❌ Global setup failed:', error);
        throw error;
    }
}

export default globalSetup;
