"""Routers module"""
from app.routers.proyectos import router as proyectos_router
from app.routers.calculos import router as calculos_router
from app.routers.optimizacion import router as optimizacion_router
from app.routers.normativa import router as normativa_router
from app.routers.gis import router as gis_router
from app.routers.reportes import router as reportes_router

__all__ = [
    "proyectos_router",
    "calculos_router",
    "optimizacion_router",
    "normativa_router",
    "gis_router",
    "reportes_router"
]
