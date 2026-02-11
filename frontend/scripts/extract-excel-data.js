const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..', '..'); // e:\FREECLOUD\FREECLOUD-IA\PROYECTOS\HidroAliaga
const files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.xlsx'));

if (files.length === 0) {
    console.error("No Excel file found in project root.");
    process.exit(1);
}

const wb = XLSX.readFile(path.join(projectRoot, files[0]));
// Sheet name might have trailing space in "Verifica red EN PULG "
const targetName = "Verifica red EN PULG";
const wsName = wb.SheetNames.find(n => n.trim() === targetName);

if (!wsName) {
    console.error(`Sheet "${targetName}" not found. Available: ${wb.SheetNames.join(', ')}`);
    process.exit(1);
}

const ws = wb.Sheets[wsName];

const data = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

function cleanNum(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

const conductionData = [];
const distributionData = [];

// Conduction: Rows ~33 (header) to 44
// Headers R031 (index 30): Elemento, Nivel Dinámico, Longitud (Km), Caudal tramo, Pendiente S, Diámetro en ", Diám. Comercial, Velocidad Flujo, Hf, H. Piezométrica, Presión
// Data starts index 33 ("1", 2900...)
// Mapping based on column indices (0-based) from visual inspection of excel_analysis.txt:
// A(0): Elemento (Node Name)
// B(1): Nivel Dinámico (Elev)
// C(2): Longitud Km -> *1000 for m
// D(3): Caudal tramo
// E(4): Pendiente S
// G(6): Diámetro Comercial "
// H(7): Velocidad Flujo
// I(8): Hf
// J(9): H. Piezométrica
// K(10): Presión

for (let i = 33; i <= 44; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;

    // Column indices shifted by +1 (A=0 is empty, B=1 is Elemento)
    const name = String(row[1] || '').trim();
    if (String(row[1]).includes("RESERVORIO") || !row[1]) {
        if (String(row[1]).includes("RESERVORIO")) {
            // Add reservoir as last node if needed, usually it's the *start* of distribution?
            // In Conduction, Reservorio is the END point (row 45 in text, index 44).
            conductionData.push({
                type: 'reservoir_out',
                name: 'RES-LLEGADA',
                elevation: cleanNum(row[2]), // Col C is usually empty for reservoir row, wait.
                // In text: R045: | RESERVORIO | 2149.08 | 0.043 | ...
                // Col 1 is 2149.08 (Elev)
                elevation: cleanNum(row[2]),
                pressure_ref: cleanNum(row[11]) // K=10 -> 11
            });
        }
        continue;
    }

    conductionData.push({
        type: 'node',
        name: name,
        elevation: cleanNum(row[2]), // B=1 -> C=2 (Elev is in C? Text says 2900 is 2nd value shown? " | 1 | 2900 ". Yes 1=Name, 2=Elev)
        len_km: cleanNum(row[3]),
        q_tramo: cleanNum(row[4]),
        slope_ref: cleanNum(row[5]),
        dia_pulg: cleanNum(row[7]), // G=6 -> 7
        vel_ref: cleanNum(row[8]),
        hf_ref: cleanNum(row[9]),
        piezo_ref: cleanNum(row[10]),
        pressure_ref: cleanNum(row[11])
    });
}

// Distribution: Rows ~53 (header) to end
// Headers R051: Elemento, Nivel, Long(Km), Caudal, S, Dia", DiaCom, Vel, Hf, H.PiezoF, Presión, C.Piezom. i Salida, Viviendas
// A(0): Elemento
// B(1): Nivel (Elev)
// C(2): Long Km
// D(3): Caudal
// E(4): Pendiente
// G(6): Dia Comercial
// H(7): Vel
// I(8): Hf
// J(9): H. Piezo F (Final?)
// K(10): Presión
// N(13): Viviendas (Col 13? Let's check text file R051. "viviendas" is way over.)
// Text file R054: | A | 2527 | 0.14 | 1.711 | ... | 14.49 (Presion) | ...
// Viviendas seems to be in column "M" or "N"?
// R051: ... | Presión | C.Piezom. i Salida | | viviendas |
// K(10)=Presion, L(11)=CPiezSalida, M(12)=Empty?, N(13)=Viviendas?
// Let's verify with Data R054 ("A"): | A | ... | 14.49 | 2541.49 | | | | ... | 0.14? No.
// Let's rely on mapping: 
// Col 13 (N) seems to be viviendas in R051 header.
// In R111 (Sheet Ejemplo 01), Col 4 is Viviendas.
// In "Verifica red", let's look at row 54 ("A"). 
// R054: ... | 14.491838 | 2541.491838 | | | | | 0.140000 | ...
// It's tricky. Let's try to find index of "viviendas" from row 51 header? No, header is messy.
// Let's guess: Col 13 or 17?
// R054 has "0.140000" at the very end. The header says "viviendas" then diameter columns?
// Wait, the text file R054 ending: "| 0.140000 | 0 | 0". These look like diameter lengths? 
// Actually, R051 header ends with "Ø1 1/2" | Ø1" | Ø3/4"".
// The number of families might be implicit or in "Caudal tramo" calc? Q = Viv * Rate?
// R054 Caudal is 1.711. R008 Pop=240. 
// Let's assume input text file had "N viviendas" in header R051.
// R051: "... | Presión | C.Piezom. i Salida | | viviendas | | | Ø1 1/2" ..."
// It seems visible. I will try to pluck it from column 13.

for (let i = 54; i <= 65; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;

    conductionData.push({ // Just adding to same list for now, distinguishing by type/context implies split later or sequential
        type: 'distribution_node',
        name: String(row[1]).trim(),
        elevation: cleanNum(row[2]),
        len_km: cleanNum(row[3]),
        q_tramo: cleanNum(row[4]),
        slope_ref: cleanNum(row[5]),
        dia_pulg: cleanNum(row[7]),
        vel_ref: cleanNum(row[8]),
        hf_ref: cleanNum(row[9]),
        piezo_ref: cleanNum(row[10]),
        pressure_ref: cleanNum(row[11]),
        // Viviendas is tricky. Let's look at R117 (E->F). R117 says "16" viviendas? 
        // In "Verifica red" R062 (F) seems to have 0.186 Q.
        // Let's try to grab column 13 (0-based index 13? Or 14?)
        // R051 "viviendas" is 4th from "Presión" (10). 11, 12, 13?
        viviendas: cleanNum(row[14]) // Shifted 13->14
    });
}

const out = {
    conduction: conductionData.filter(d => d.type === 'node' || d.type === 'reservoir_out'),
    distribution: conductionData.filter(d => d.type === 'distribution_node')
};

fs.writeFileSync(path.join(__dirname, 'cruz_pata_data.json'), JSON.stringify(out, null, 2), 'utf8');
console.log("Extracted data to scripts/cruz_pata_data.json");
