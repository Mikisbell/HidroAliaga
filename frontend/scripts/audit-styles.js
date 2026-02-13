/**
 * Script de auditoría de estilos
 * Extrae y compara clases CSS entre page.tsx y dashboard/page.tsx
 */

const fs = require('fs');
const path = require('path');

// Archivos a auditar
const files = [
  'src/app/page.tsx',
  'src/app/(dashboard)/dashboard/page.tsx'
];

// Expresión regular para extraer clases de className
const classNameRegex = /className="([^"]+)"/g;

function extractClasses(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const classes = new Set();
  
  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    const classString = match[1];
    // Dividir por espacios y agregar cada clase
    classString.split(/\s+/).forEach(cls => {
      if (cls.trim()) classes.add(cls.trim());
    });
  }
  
  return classes;
}

function categorizeClasses(classes) {
  const categories = {
    buttons: new Set(),
    cards: new Set(),
    badges: new Set(),
    spacing: new Set(),
    typography: new Set(),
    colors: new Set(),
    animations: new Set(),
    layout: new Set(),
    custom: new Set()
  };
  
  classes.forEach(cls => {
    if (cls.includes('btn-') || cls.startsWith('h-') && cls.match(/h-\d+/)) {
      categories.buttons.add(cls);
    } else if (cls.includes('card') || cls.includes('glass-') || cls.includes('stat-')) {
      categories.cards.add(cls);
    } else if (cls.includes('badge')) {
      categories.badges.add(cls);
    } else if (cls.match(/^(p|m|gap|space)-/) || cls.includes('px-') || cls.includes('py-')) {
      categories.spacing.add(cls);
    } else if (cls.match(/^text-/) || cls.includes('font-') || cls.includes('tracking-')) {
      categories.typography.add(cls);
    } else if (cls.includes('bg-') || cls.includes('text-') || cls.includes('border-')) {
      categories.colors.add(cls);
    } else if (cls.includes('animate-') || cls.includes('transition-')) {
      categories.animations.add(cls);
    } else if (cls.match(/^(flex|grid|w-|h-|max-|min-)/) || cls.includes('overflow-')) {
      categories.layout.add(cls);
    } else {
      categories.custom.add(cls);
    }
  });
  
  return categories;
}

function compareClasses(classes1, classes2, label1, label2) {
  const only1 = new Set([...classes1].filter(x => !classes2.has(x)));
  const only2 = new Set([...classes2].filter(x => !classes1.has(x)));
  const common = new Set([...classes1].filter(x => classes2.has(x)));
  
  return { only1, only2, common };
}

// Ejecutar auditoría
console.log('🔍 Auditando estilos...\n');

const pageClasses = extractClasses(files[0]);
const dashboardClasses = extractClasses(files[1]);

console.log(`📄 ${files[0]}: ${pageClasses.size} clases únicas`);
console.log(`📄 ${files[1]}: ${dashboardClasses.size} clases únicas\n`);

// Categorizar clases
const pageCategories = categorizeClasses(pageClasses);
const dashboardCategories = categorizeClasses(dashboardClasses);

console.log('📊 RESUMEN POR CATEGORÍA:\n');

Object.keys(pageCategories).forEach(category => {
  const pageCount = pageCategories[category].size;
  const dashCount = dashboardCategories[category].size;
  const comparison = compareClasses(
    pageCategories[category],
    dashboardCategories[category],
    'page',
    'dashboard'
  );
  
  console.log(`${category.toUpperCase()}:`);
  console.log(`  Page: ${pageCount} clases`);
  console.log(`  Dashboard: ${dashCount} clases`);
  console.log(`  Comunes: ${comparison.common.size}`);
  console.log(`  Solo en Page: ${comparison.only1.size}`);
  console.log(`  Solo en Dashboard: ${comparison.only2.size}`);
  console.log('');
});

// Generar reporte detallado
const report = {
  timestamp: new Date().toISOString(),
  files: {
    page: files[0],
    dashboard: files[1]
  },
  summary: {
    page: {
      total: pageClasses.size,
      categories: Object.fromEntries(
        Object.entries(pageCategories).map(([k, v]) => [k, v.size])
      )
    },
    dashboard: {
      total: dashboardClasses.size,
      categories: Object.fromEntries(
        Object.entries(dashboardCategories).map(([k, v]) => [k, v.size])
      )
    }
  },
  inconsistencies: {}
};

// Detectar inconsistencias
Object.keys(pageCategories).forEach(category => {
  const comparison = compareClasses(
    pageCategories[category],
    dashboardCategories[category],
    'page',
    'dashboard'
  );
  
  if (comparison.only1.size > 0 || comparison.only2.size > 0) {
    report.inconsistencies[category] = {
      onlyInPage: Array.from(comparison.only1),
      onlyInDashboard: Array.from(comparison.only2)
    };
  }
});

// Guardar reporte
const reportPath = path.join(__dirname, 'style-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`✅ Reporte guardado en: ${reportPath}\n`);

// Mostrar inconsistencias críticas
console.log('⚠️  INCONSISTENCIAS CRÍTICAS:\n');

if (report.inconsistencies.buttons) {
  console.log('BOTONES:');
  console.log('  Solo en Page:', report.inconsistencies.buttons.onlyInPage.slice(0, 5).join(', '));
  console.log('  Solo en Dashboard:', report.inconsistencies.buttons.onlyInDashboard.slice(0, 5).join(', '));
  console.log('');
}

if (report.inconsistencies.cards) {
  console.log('CARDS:');
  console.log('  Solo en Page:', report.inconsistencies.cards.onlyInPage.slice(0, 5).join(', '));
  console.log('  Solo en Dashboard:', report.inconsistencies.cards.onlyInDashboard.slice(0, 5).join(', '));
  console.log('');
}

console.log('✨ Auditoría completada');
