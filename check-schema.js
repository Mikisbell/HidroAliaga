
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking schema for table: proyectos')

    // Try to select a single row to see what happens, or use rpc if available?
    // Actually, we can just try to select * limit 1 and look at the keys if any data exists.
    // Or better, assume we have access to metadata if we are admin? No, we use anon key here usually.

    // Let's try to insert a dummy record with JUST the name to see if it works, 
    // and check if we can select 'ambito'

    const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre, ambito')
        .limit(1)

    if (error) {
        console.error('Error selecting ambito:', error)
    } else {
        console.log('Success selecting ambito. Data sample:', data)
    }
}

checkSchema()
