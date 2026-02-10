# Guía de Instalación y Configuración

## HidroAliaga

Sistema de Diseño, Análisis y Optimización de Redes de Distribución de Agua Potable

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación del Backend](#instalación-del-backend)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Instalación del Frontend](#instalación-del-frontend)
5. [Ejecución del Sistema](#ejecución-del-sistema)
6. [Verificación de la Instalación](#verificación-de-la-instalación)
7. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
8. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### Software Requerido

| Software | Versión Mínima | Descripción |
|----------|----------------|-------------|
| Python | 3.10+ | Lenguaje de programación backend |
| Node.js | 18+ | Entorno JavaScript frontend |
| PostgreSQL | 14+ | Sistema de base de datos |
| PostGIS | 3.x | Extensión espacial para PostgreSQL |
| Git | 2.x | Control de versiones |

### Verificar Instalación

```bash
# Verificar Python
python --version

# Verificar Node.js
node --version

# Verificar PostgreSQL
psql --version

# Verificar Git
git --version
```

---

## Instalación del Backend

### 1. Clonar el Repositorio (si no existe)

```bash
cd e:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga
```

### 2. Crear Entorno Virtual

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate

# Verificar activación
which python  # Debe mostrar la ruta del venv
```

### 3. Instalar Dependencias

```bash
# Actualizar pip
pip install --upgrade pip

# Instalar dependencias del proyecto
pip install -e .

# O usar requirements.txt si está disponible
pip install -r requirements.txt
```

### 4. Dependencias Principales Instaladas

```
fastapi>=0.109.0      # Framework web
uvicorn>=0.27.0       # Servidor ASGI
sqlalchemy>=2.0.25    # ORM de base de datos
asyncpg>=0.29.0       # Driver PostgreSQL async
geoalchemy2>=0.14.0   # Integración PostGIS
wntr>=0.3.0          # Simulación hidráulica
numpy>=1.26.0        # Cálculos numéricos
pandas>=2.1.0       # Manipulación de datos
deap>=1.3.0         # Algoritmos Genéticos
httpx>=0.26.0       # Cliente HTTP async
```

---

## Configuración de Base de Datos

### 1. Instalar PostgreSQL y PostGIS

#### Windows (使用 Chocolatey):

```powershell
choco install postgresql14
choco install postgis
```

#### Windows (Instalador oficial):

1. Descargar PostgreSQL desde https://www.postgresql.org/download/windows/
2. Ejecutar el instalador
3. Durante la instalación, seleccionar PostGIS

#### Verificar PostGIS:

```bash
psql -U postgres
```

En psql:
```sql
SELECT PostGIS_full_version();
```

### 2. Crear Usuario y Base de Datos

```bash
# Conectar como postgres
psql -U postgres

# Crear usuario
CREATE USER hredes WITH PASSWORD 'hredes123';

# Crear base de datos
CREATE DATABASE hredes_peru OWNER hredes;

# Conectar a la base de datos
\c hredes_peru

# Habilitar PostGIS
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Otorgar permisos
GRANT ALL ON DATABASE hredes_peru TO hredes;
GRANT ALL ON SCHEMA public TO hredes;

# Salir
\q
```

### 3. Configurar Conexión

Crear archivo `.env` en `backend/`:

```env
# Base de Datos
DATABASE_URL=postgresql+asyncpg://hredes:hredes123@localhost:5432/hredes_peru
DATABASE_URL_SYNC=postgresql://hredes:hredes123@localhost:5432/hredes_peru

# Aplicación
DEBUG=True
HOST=0.0.0.0
PORT=8000

# LLM (Opcional)
LLM_API_KEY=tu_api_key_de_openai
LLM_MODEL=gpt-4

# GIS
ELEVATION_API_URL=https://api.open-elevation.com/api/v1/lookup
```

---

## Instalación del Frontend

### 1. Navegar al Directorio Frontend

```bash
cd frontend
```

### 2. Instalar Dependencias

```bash
# Usar npm
npm install

# O usar yarn
yarn install
```

### 3. Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0",
  "axios": "^1.6.2",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "tailwindcss": "^3.4.0",
  "@headlessui/react": "^1.7.17",
  "recharts": "^2.10.3",
  "vite": "^5.0.10"
}
```

---

## Ejecución del Sistema

### 1. Iniciar el Backend

```bash
# En terminal 1 - Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: http://localhost:8000

Documentación API: http://localhost:8000/docs

### 2. Iniciar el Frontend

```bash
# En terminal 2 - Frontend
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:3000

---

## Verificación de la Instalación

### 1. Verificar Backend

```bash
# Endpoint de salud
curl http://localhost:8000/health

# Respuesta esperada:
# {"estado":"saludable","version":"1.0.0"}
```

### 2. Verificar Frontend

1. Abrir navegador en http://localhost:3000
2. Verificar que加载 el Dashboard
3. Probar navegación entre secciones

### 3. Verificar API

Acceder a http://localhost:8000/docs para ver la documentación interactiva de la API.

Endpoints principales:
- `GET /api/v1/proyectos` - Listar proyectos
- `POST /api/v1/proyectos` - Crear proyecto
- `POST /api/v1/calculos/{id}/calcular` - Ejecutar cálculo
- `POST /api/v1/optimizacion/{id}/optimizar` - Optimizar red

---

## Configuración de Variables de Entorno

### Backend (.env)

```env
# Base de Datos
DATABASE_URL=postgresql+asyncpg://hredes:hredes123@localhost:5432/hredes_peru
DATABASE_URL_SYNC=postgresql://hredes:hredes123@localhost:5432/hredes_peru

# Aplicación
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Motor Hidráulico
HARDY_CROSS_TOLERANCE=1e-7
MAX_ITERATIONS=1000
HAZEN_WILLIAMS_EXPONENT=1.852

# Normativa Peruana
PRESION_MINIMA_URBANA=10.0
PRESION_MINIMA_RURAL=5.0
VELOCIDAD_MAXIMA=3.0
VELOCIDAD_MINIMA=0.6
DIAMETRO_MINIMO_URBANO=75.0
DIAMETRO_MINIMO_RURAL=25.0

# Algoritmo Genético
GA_POBLACION_SIZE=100
GA_GENERACIONES=50

# LLM
LLM_API_KEY=
LLM_MODEL=gpt-4

# GIS
ELEVATION_API_URL=https://api.open-elevation.com/api/v1/lookup
```

### Frontend (.env)

Crear archivo `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=HidroAliaga
```

---

## Solución de Problemas

### Error: psycopg2 no instala

```bash
# Windows
pip install psycopg2-binary

# O usar conda
conda install -c anaconda psycopg2
```

### Error: PostGIS no encontrado

```sql
-- Verificar extensiones
SELECT * FROM pg_extension;

-- Instalar PostGIS si no existe
CREATE EXTENSION postgis;
```

### Error: Puerto ya en uso

```bash
# Cambiar puerto del backend
uvicorn main:app --port 8001

# Cambiar puerto del frontend
npm run dev -- --port 3001
```

### Error: Módulo no encontrado

```bash
# Reinstalar dependencias
pip uninstall -y -r requirements.txt
pip install -r requirements.txt

# Verificar entorno virtual
which python
pip list
```

### Error: CORS

Verificar que los orígenes estén configurados correctamente:

```python
# En settings.py
CORS_ORIGINS = ["http://localhost:3000"]
```

---

## Estructura de Archivos Generada

```
e:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/
├── README.md                    # Documentación principal
├── INSTALLATION.md              # Esta guía
├── backend/
│   ├── pyproject.toml
│   ├── main.py
│   ├── .env                     # Variables de entorno
│   └── app/
│       ├── config/settings.py
│       ├── core/
│       │   ├── hidraulico.py
│       │   ├── optimizador.py
│       │   └── normativa.py
│       ├── db/
│       │   ├── database.py
│       │   └── models.py
│       ├── schemas/schemas.py
│       └── routers/
│           ├── proyectos.py
│           ├── calculos.py
│           ├── optimizacion.py
│           ├── normativa.py
│           ├── gis.py
│           └── reportes.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        └── pages/
```

---

## Próximos Pasos

1. [ ] Verificar que todos los servicios estén corriendo
2. [ ] Crear primer proyecto de prueba
3. [ ] Ejecutar primer cálculo hidráulico
4. [ ] Probar optimización de diámetros
5. [ ] Configurar LLM para copiloto normativo

---

## Soporte

Para dudas o problemas:
- Consultar la documentación de la API en http://localhost:8000/docs
- Revisar los logs del servidor
- Verificar la configuración de base de datos

---

*Documentación generada para HidroAliaga v1.0*
*Fecha: 2024*
