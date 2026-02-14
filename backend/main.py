"""
HidroAliaga - Backend Principal
Sistema de Diseño, Análisis y Optimización de Redes de Distribución de Agua Potable

Autor: HidroAliaga Team
Licencia: MIT
"""

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config.settings import settings
from app.routers import proyectos, calculos, gis, optimizacion, normativa, reportes
from app.db.database import sync_engine as engine, Base
from app.dependencies.auth import AuthorizationError, AuthenticationError


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestiona el ciclo de vida de la aplicación"""
    # Startup: Crear tablas de base de datos
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Limpieza


# Crear aplicación FastAPI
app = FastAPI(
    title="HidroAliaga API",
    description="""
    ## Sistema de Diseño, Análisis y Optimización de Redes de Distribución de Agua Potable
    
    Esta API proporciona endpoints protegidos con autenticación JWT para:
    - Gestión de proyectos de redes de agua potable (aislados por usuario)
    - Cálculos hidráulicos (Hardy Cross, redes abiertas/mixtas)
    - Visualización GIS
    - Optimización de diámetros con Algoritmos Genéticos
    - Consultas normativas (RNE, RM 192-2018, etc.)
    - Generación de reportes
    
    ### Seguridad:
    - Autenticación mediante tokens JWT de Supabase
    - Aislamiento de datos por usuario (multi-tenant)
    - Verificación de propiedad en todas las operaciones
    
    ### Normativa Implementada:
    - RNE Norma OS.050
    - RM 192-2018-VIVIENDA (Ámbito Rural)
    - RM 107-2025-VIVIENDA (Dotaciones según clima)
    """,
    version="1.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Manejadores de excepciones globales
@app.exception_handler(AuthorizationError)
async def authorization_exception_handler(request: Request, exc: AuthorizationError):
    """Maneja errores de autorización"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_type": "authorization"},
    )


@app.exception_handler(AuthenticationError)
async def authentication_exception_handler(request: Request, exc: AuthenticationError):
    """Maneja errores de autenticación"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_type": "authentication"},
        headers=exc.headers,
    )


# Incluir routers
app.include_router(proyectos.router, prefix="/api/v1/proyectos", tags=["Proyectos"])
app.include_router(
    calculos.router, prefix="/api/v1/calculos", tags=["Cálculos Hidráulicos"]
)
app.include_router(gis.router, prefix="/api/v1/gis", tags=["GIS"])
app.include_router(
    optimizacion.router, prefix="/api/v1/optimizacion", tags=["Optimización"]
)
app.include_router(normativa.router, prefix="/api/v1/normativa", tags=["Normativa"])
app.include_router(reportes.router, prefix="/api/v1/reportes", tags=["Reportes"])


@app.get("/", tags=["Inicio"])
async def root():
    """Endpoint raíz de la API"""
    return {
        "mensaje": "Bienvenido a HidroAliaga API",
        "version": "1.0.0",
        "documentacion": "/docs",
        "estado": "activo",
    }


@app.get("/health", tags=["Salud"])
async def health_check():
    """Verificación de estado de la API"""
    return {"estado": "saludable", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
