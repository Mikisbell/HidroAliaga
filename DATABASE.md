# 🔧 Configuración de Base de Datos - HidroAliaga

## Supabase Setup Guide

### Paso 1: Crear Proyecto en Supabase

1. Ir a https://supabase.com
2. Click en **"New Project"**
3. Completar datos:
   - **Organization**: Tu nombre o empresa
   - **Name**: `hidroaliaga`
   - **Database Password**: Generar una contraseña segura y guardarla

### Paso 2: Habilitar PostGIS

En el **SQL Editor** de Supabase, ejecutar el contenido de [`schema_supabase.sql`](database/schema_supabase.sql):

```sql
-- Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verificar instalación
SELECT PostGIS_full_version();
```

### Paso 4: Conectar desde Backend

Crear archivo `.env` en `backend/`:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.hmwaoxbluljfqmsytyjv.supabase.co:5432/postgres
SUPABASE_URL=https://hmwaoxbluljfqmsytyjv.supabase.co
SUPABASE_KEY=sb_publishable_KlknSlm-QaLi7cM0cXEQnA_xwcNMHuC
```

---

## 📁 Archivos del Proyecto

```
HidroAliaga/
├── database/
│   └── schema_supabase.sql    ← Ejecutar en Supabase SQL Editor
├── backend/
│   ├── app/db/database.py    ← Conexión a PostgreSQL
│   └── .env                   ← Variables de entorno
└── frontend/
```

---

## ✅ Verificar Instalación

Ejecutar en SQL Editor:

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar PostGIS
SELECT PostGIS_full_version();
```

---

## 🔑 Credenciales

| Campo | Valor |
|-------|-------|
| Project URL | `https://hmwaoxbluljfqmsytyjv.supabase.co` |
| Publishable Key | `sb_publishable_KlknSlm-QaLi7cM0cXEQnA_xwcNMHuC` |
| Service Role Key | `eyJhbG...` (solo para backend) |
| Database Password | `________________________` |
| Host | `db.hmwaoxbluljfqmsytyjv.supabase.co` |
| Port | `5432` |

---

## 🌐 URL del Proyecto

**Supabase:** https://hmwaoxbluljfqmsytyjv.supabase.co

---

## ✅ Estado de Configuración

| Componente | Estado |
|------------|--------|
| Supabase Project | ✅ Creado |
| Publishable Key | ✅ Configurada |
| .env file | ✅ Creado (falta Database Password) |
| Schema SQL | ⏳ Por ejecutar |
| PostGIS | ⏳ Por habilitar |

---

## 📋 Próximos Pasos

1. **Ejecutar schema en Supabase SQL Editor:**
   - Abrir: https://hmwaoxbluljfqmsytyjv.supabase.co/project/sql
   - Copiar contenido de `database/schema_supabase.sql`
   - Click en "Run"

2. **Completar Database Password en `backend/.env`**:
   ```env
   DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.hmwaoxbluljfqmsytyjv.supabase.co:5432/postgres
   ```
   Reemplazar `TU_PASSWORD` con la contraseña que usaste al crear el proyecto.
