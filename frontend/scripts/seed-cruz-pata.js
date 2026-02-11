const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cruzPataData = require('./cruz_pata_data.json');

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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// 2. Data Definitions (from Hydraulic Analysis)
const PROJECT_NAME = "Agua Potable - Cruz Pata";

// NODES
// Conduction: Captación -> 1 -> ... -> 11 -> RES
// Distribution: RES -> A -> B ...
const NODES = [
    // Conduction Line (North to South)
    { codigo: 'CAPT', nombre: 'Captación', tipo: 'captacion', elevacion: 2975.44, x: 0, y: 0 },
    { codigo: 'N-1', nombre: 'Nudo 1', tipo: 'union', elevacion: 2900.00, x: 0, y: -573 },
    { codigo: 'N-2', nombre: 'Nudo 2', tipo: 'union', elevacion: 2825.00, x: 0, y: -766 },
    { codigo: 'N-3', nombre: 'Nudo 3', tipo: 'union', elevacion: 2750.00, x: 0, y: -4155 },
    { codigo: 'N-4', nombre: 'Nudo 4', tipo: 'union', elevacion: 2675.00, x: 0, y: -5826 },
    { codigo: 'N-5', nombre: 'Nudo 5', tipo: 'union', elevacion: 2600.00, x: 0, y: -6267 },
    { codigo: 'N-6', nombre: 'Nudo 6', tipo: 'union', elevacion: 2525.00, x: 0, y: -6435 },
    { codigo: 'N-7', nombre: 'Nudo 7', tipo: 'union', elevacion: 2450.00, x: 0, y: -6534 },
    { codigo: 'N-8', nombre: 'Nudo 8', tipo: 'union', elevacion: 2375.00, x: 0, y: -6664 },
    { codigo: 'N-9', nombre: 'Nudo 9', tipo: 'union', elevacion: 2300.00, x: 0, y: -6824 },
    { codigo: 'N-10', nombre: 'Nudo 10', tipo: 'union', elevacion: 2225.00, x: 0, y: -6941 },
    { codigo: 'N-11', nombre: 'Nudo 11', tipo: 'union', elevacion: 2154.00, x: 0, y: -7163 },

    // Reservoir (Transition)
    { codigo: 'RES', nombre: 'Reservorio', tipo: 'reservorio', elevacion: 2550.00, x: 0, y: -7206 }, // Note: Elevación 2550 in Dist sheet? Wait.
    // Analysis check: Conduction ends at RES (2149.08). Distribution starts at RES (2550).
    // Ah, there are TWO reservoirs? Or pumping?
    // Sheet 1 Row 41: RESERVORIO 2149.08.
    // Sheet 1 Row 47: Resev 2550.
    // This implies two separate systems or a mistake in the Excel.
    // Or maybe "Captación -> .. -> Node 11 -> Reservoir 1 (2149)" AND "Reservoir 2 (2550) -> A -> ..."
    // The user says "VERIFICADOR DE SISTEMAS ABIERTOS".
    // I will import BOTH as separate disjoint networks within the same project for now.
    // Or treat RES as a generic source for Distribution.
    // I'll call them RES-CAPT (2149) and RES-DIST (2550).
    { codigo: 'RES-CAPT', nombre: 'Reservorio Capt', tipo: 'reservorio', elevacion: 2149.08, x: 0, y: -7206 },

    // Distribution Network (Starting fresh at 0, -8000 for visual separation)
    { codigo: 'RES-DIST', nombre: 'Reservorio Dist', tipo: 'reservorio', elevacion: 2550.00, x: 500, y: -8000 },
    { codigo: 'A', nombre: 'Nodo A', tipo: 'union', elevacion: 2527.00, x: 640, y: -8000 },
    { codigo: 'B', nombre: 'Nodo B', tipo: 'union', elevacion: 2512.00, x: 715, y: -8000, viv: 10 },
    { codigo: 'CRP-02', nombre: 'CRP-02', tipo: 'camara_rompe_presion', elevacion: 2500.00, x: 765, y: -8000, viv: 4 },
    { codigo: 'C', nombre: 'Nodo C', tipo: 'union', elevacion: 2487.00, x: 815, y: -8000, viv: 3 },
    { codigo: 'CRP-03', nombre: 'CRP-03', tipo: 'camara_rompe_presion', elevacion: 2500.00, x: 765, y: -7950, viv: 1 }, // Branch
    { codigo: 'D', nombre: 'Nodo D', tipo: 'union', elevacion: 2492.00, x: 795, y: -7950, viv: 1 },

    { codigo: 'E', nombre: 'Nodo E', tipo: 'union', elevacion: 2500.00, x: 640, y: -8220, viv: 45 }, // Branch from A
    { codigo: 'F', nombre: 'Nodo F', tipo: 'union', elevacion: 2497.00, x: 770, y: -8220, viv: 16 },
    { codigo: 'CRP-01', nombre: 'CRP-01', tipo: 'camara_rompe_presion', elevacion: 2500.00, x: 640, y: -8221 }, // short pipe
    { codigo: 'G', nombre: 'Nodo G', tipo: 'union', elevacion: 2480.00, x: 730, y: -8221, viv: 30 },
    { codigo: 'H', nombre: 'Nodo H', tipo: 'union', elevacion: 2463.00, x: 770, y: -8221, viv: 12 },
    { codigo: 'I', nombre: 'Nodo I', tipo: 'union', elevacion: 2467.00, x: 845, y: -8260, viv: 25 }, // Branch from G
];

// PIPES
const PIPES = [
    // Conduction
    { from: 'CAPT', to: 'N-1', len: 573, dia_pulg: 2.0, mat: 'pvc' },
    { from: 'N-1', to: 'N-2', len: 193, dia_pulg: 2.0, mat: 'pvc' },
    { from: 'N-2', to: 'N-3', len: 3389, dia_pulg: 2.5, mat: 'pvc' },
    { from: 'N-3', to: 'N-4', len: 1671, dia_pulg: 2.0, mat: 'pvc' },
    { from: 'N-4', to: 'N-5', len: 441, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-5', to: 'N-6', len: 168, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-6', to: 'N-7', len: 99, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-7', to: 'N-8', len: 130, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-8', to: 'N-9', len: 160, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-9', to: 'N-10', len: 117, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-10', to: 'N-11', len: 222, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'N-11', to: 'RES-CAPT', len: 43, dia_pulg: 1.5, mat: 'pvc' },

    // Distribution
    { from: 'RES-DIST', to: 'A', len: 140, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'A', to: 'B', len: 75, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'B', to: 'CRP-02', len: 50, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'CRP-02', to: 'C', len: 50, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'B', to: 'CRP-03', len: 50, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'CRP-03', to: 'D', len: 30, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'A', to: 'E', len: 220, dia_pulg: 1.5, mat: 'pvc' },
    { from: 'E', to: 'F', len: 130, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'E', to: 'CRP-01', len: 1, dia_pulg: 1.0, mat: 'pvc' },
    { from: 'CRP-01', to: 'G', len: 90, dia_pulg: 1.0, mat: 'pvc' },
    { from: 'G', to: 'H', len: 40, dia_pulg: 0.75, mat: 'pvc' },
    { from: 'G', to: 'I', len: 115, dia_pulg: 0.75, mat: 'pvc' },
];

// Helper to find data in JSON
function findNodeData(name) {
    let output = cruzPataData.conduction.find(n => n.name === name);
    if (!output) output = cruzPataData.distribution.find(n => n.name === name);
    return output;
}

// Enrich NODES with reference data
const ENRICHED_NODES = NODES.map(n => {
    const data = findNodeData(n.codigo);
    return {
        ...n,
        presion_diseno: data ? data.pressure_ref : null,
        cota_piezometrica_diseno: data ? data.piezo_ref : null,
        numero_viviendas: (data && data.viviendas) ? data.viviendas : (n.viv || 0)
    };
});

// Enrich PIPES with reference data (using 'to' node as key)
const ENRICHED_PIPES = PIPES.map(p => {
    const data = findNodeData(p.to);
    return {
        ...p,
        velocidad_diseno: data ? data.vel_ref : null,
        hf_diseno: data ? data.hf_ref : null,
        pendiente_diseno: data ? data.slope_ref : null,
        caudal_diseno: data ? data.q_tramo : null
    };
});

async function main() {
    console.log(`Starting import for: ${PROJECT_NAME}`);

    // Get Admin User
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    const adminUser = users[0]; // Just take first user
    if (!adminUser) throw new Error("No users found in database");

    console.log(`Using owner: ${adminUser.email} (${adminUser.id})`);

    // 1. Delete Existing Project
    const { error: delError } = await supabase
        .from('proyectos')
        .delete()
        .eq('nombre', PROJECT_NAME);

    if (delError) console.error("Error deleting old project:", delError.message);

    // 2. Create Project
    const { data: project, error: projError } = await supabase.from('proyectos').insert({
        nombre: PROJECT_NAME,
        distrito: 'Abancay', // Changed from ubicacion to distrito
        descripcion: 'Proyecto importado de Excel para benchmark hidráulico',
        estado: 'activo',
        usuario_id: adminUser.id,
        ambito: 'rural', // OS.050 formula used in excel
    }).select().single();

    if (projError) throw new Error(`Create Project Error: ${projError.message}`);
    console.log(`Project Created: ${project.id}`);

    // 3. Insert Nodes
    const nodeMap = new Map(); // code -> id

    // Dotacion info from Excel: qu = 0.002326 L/s per person? No per Tramo?
    // Excel says "qu (por tramo) | N viviendas". 
    // And "Caudal Unitario qu = 0.002326 L/s". 
    // Wait, Excel col "Qu (por tramo)" seems to be Total Flow for that node/section?
    // Formula Q = Pob * Dot / 86400.
    // Excel "qu" = 0.002326? 
    // Let's use the node demand based on 'viv' * 'qu_viv'.
    // Qmd = 0.354 L/s total.
    // I will set 'demanda_base' for each node if it has 'viv'.
    // qu_viv = Qmh_total / Total_Viv? 
    // Qmh = 1.711. Total Viv = 147.
    // 1.711 / 147 = 0.0116 L/s/viv.
    // Excel R054 (Tramo A-B, 10 viv). Q_tramo = 0.116? 
    // 10 * 0.0116 = 0.116. Yes.
    // So unit demand = 0.01164 L/s/viv.

    const QU_VIV = 0.01164;

    console.log(`Inserting ${ENRICHED_NODES.length} nodes...`);
    for (const n of ENRICHED_NODES) {
        const demanda = n.demanda_base || (n.numero_viviendas * QU_VIV); // Use Enriched numero_viviendas

        const { data: node, error: nError } = await supabase.from('nudos').insert({
            proyecto_id: project.id,
            codigo: n.codigo,
            nombre: n.nombre,
            tipo: n.tipo,
            elevacion: n.elevacion,
            latitud: -13.6 + (n.y / 111000), // Approx conversion y(m) to lat
            longitud: -72.8 + (n.x / 111000), // Approx conversion x(m) to lon
            demanda_base: demanda,
            numero_viviendas: n.numero_viviendas,
            cota_terreno: n.elevacion,

            // New Reference Fields
            presion_diseno: n.presion_diseno,
            cota_piezometrica_diseno: n.cota_piezometrica_diseno
        }).select().single();

        if (nError) {
            console.error(`Error node ${n.codigo}:`, nError.message);
        } else {
            nodeMap.set(n.codigo, node.id);
        }
    }
    console.log(`Nodes inserted: ${nodeMap.size}`);

    // 4. Insert Pipes
    let pipesCount = 0;
    console.log(`Inserting ${ENRICHED_PIPES.length} pipes...`);
    for (const p of ENRICHED_PIPES) {
        const sourceId = nodeMap.get(p.from);
        const targetId = nodeMap.get(p.to);

        if (!sourceId || !targetId) {
            console.warn(`Skipping pipe ${p.from}->${p.to}, node not found`);
            continue;
        }

        // Calculate diameter in mm
        let d_mm = 0;
        if (p.dia_pulg === 2.5) d_mm = 63.5;
        else if (p.dia_pulg === 2.0) d_mm = 50.8;
        else if (p.dia_pulg === 1.5) d_mm = 43.4;
        else if (p.dia_pulg === 1.0) d_mm = 29.4;
        else if (p.dia_pulg === 0.75) d_mm = 22.9;
        else d_mm = p.dia_pulg * 25.4; // Fallback

        const { error: pError } = await supabase.from('tramos').insert({
            proyecto_id: project.id,
            nudo_origen_id: sourceId,
            nudo_destino_id: targetId,
            codigo: `T-${++pipesCount}`,
            longitud: p.len,
            diametro_interior: d_mm,
            diametro_comercial: p.dia_pulg,
            material: p.mat,
            coef_hazen_williams: 150
        });

        if (pError) console.error(`Error pipe ${p.from}->${p.to}:`, pError.message);
    }
    console.log(`Pipes inserted: ${pipesCount}`);

    console.log("Seed completed successfully.");
}

main().catch(console.error);
