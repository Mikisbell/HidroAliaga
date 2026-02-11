const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dir = 'e:\\FREECLOUD\\FREECLOUD-IA\\PROYECTOS\\HidroAliaga';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));
const wb = XLSX.readFile(path.join(dir, files[0]));
const out = [];

wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });

    out.push(`\n${'='.repeat(100)}`);
    out.push(`SHEET: "${name}" — ${data.length} rows`);
    out.push('='.repeat(100));

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const hasContent = row.some(v => v !== '' && v !== null && v !== undefined);
        if (hasContent) {
            const vals = row.map(v => {
                if (v === '' || v === null || v === undefined) return '';
                if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(6);
                return String(v).substring(0, 40);
            });
            out.push(`R${String(i).padStart(3, '0')}: ${vals.join(' | ')}`);
        }
    }

    if (ws['!merges']) {
        out.push(`\nMerged cells: ${ws['!merges'].length}`);
        ws['!merges'].slice(0, 20).forEach(m => {
            out.push(`  ${XLSX.utils.encode_range(m)}`);
        });
    }
});

fs.writeFileSync(path.join(dir, 'excel_analysis.txt'), out.join('\n'), 'utf8');
console.log('Written to excel_analysis.txt');
