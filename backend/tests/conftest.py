"""
Conftest para Tests de Integración - HidroAliaga
Mocks de GeoAlchemy2/PostGIS para compatibilidad con SQLite/aiosqlite
"""

import sys, os

# Ensure backend is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ============================================================
# 1. Set env var to disable GeoAlchemy2 management
# ============================================================
os.environ.setdefault("SPATIALITE_LIBRARY_PATH", "")

# ============================================================
# 2. COMPILADORES: Hacer que tipos PostGIS compilen en SQLite
# ============================================================

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry

@compiles(Geometry, 'sqlite')
def compile_geometry_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

# ============================================================
# 3. PARCHE: Desactivar AsEWKB() wrapping en SELECT
# ============================================================

import geoalchemy2.types

@classmethod
def _patched_column_expression(cls, col):
    """Devuelve la columna sin AsEWKB() wrapper"""
    return col

geoalchemy2.types.Geometry.column_expression = _patched_column_expression

# ============================================================
# 4. PARCHE: Deshabilitar DDL management de GeoAlchemy2
#    Monkey-patch las funciones que GeoAlchemy2 registra en
#    after_create / before_drop events de tablas con Geometry columns.
# ============================================================

import geoalchemy2

# Intentar desactivar la creación de spatial management
# GeoAlchemy2 usa _setup_ddl o _listen_for_table events
try:
    # Monkey-patch check_management_column (usado internamente)
    import geoalchemy2.admin.dialects.common as _gac
    
    # Reemplazar las funciones que ejecutan SQL de PostGIS
    if hasattr(_gac, 'check_management_column'):
        _gac.check_management_column = lambda *a, **kw: False
    
    # before_create: RecoverGeometryColumn
    if hasattr(_gac, 'before_create'):
        _orig_bc = _gac.before_create
        def _safe_before_create(table, bind, **kw):
            if bind.dialect.name == 'sqlite':
                return
            return _orig_bc(table, bind, **kw)
        _gac.before_create = _safe_before_create
    
    # after_create: CreateSpatialIndex  
    if hasattr(_gac, 'after_create'):
        _orig_ac = _gac.after_create
        def _safe_after_create(table, bind, **kw):
            if bind.dialect.name == 'sqlite':
                return
            return _orig_ac(table, bind, **kw)
        _gac.after_create = _safe_after_create
    
    # before_drop: CheckSpatialIndex, DisableSpatialIndex, DiscardGeometryColumn
    if hasattr(_gac, 'before_drop'):
        _orig_bd = _gac.before_drop
        def _safe_before_drop(table, bind, **kw):
            if bind.dialect.name == 'sqlite':
                return
            return _orig_bd(table, bind, **kw)
        _gac.before_drop = _safe_before_drop
        
except (ImportError, AttributeError):
    pass

# ============================================================
# 5. FUNCIONES SQLITE: Mock de funciones SpatiaLite
# ============================================================

from sqlalchemy import event, Engine

@event.listens_for(Engine, "connect")
def register_sqlite_functions(dbapi_connection, connection_record):
    """Registra funciones SpatiaLite mock para cualquier conexión SQLite"""
    create_fn = getattr(dbapi_connection, 'create_function', None)
    if not create_fn:
        return
    
    try:
        create_fn("RecoverGeometryColumn", -1, lambda *a: 1)
        create_fn("DiscardGeometryColumn", -1, lambda *a: 1)
        create_fn("GeometryType", -1, lambda *a: "POINT")
        create_fn("CreateSpatialIndex", -1, lambda *a: 1)
        create_fn("CheckSpatialIndex", -1, lambda *a: 1)
        create_fn("DisableSpatialIndex", -1, lambda *a: 1)
        create_fn("ST_AsText", 1, lambda *a: str(a[0]) if a[0] else None)
        create_fn("ST_GeomFromText", -1, lambda *a: a[0] if a else None)
        create_fn("AsEWKB", 1, lambda *a: a[0] if a else None)
        create_fn("AsEWKT", 1, lambda *a: str(a[0]) if a[0] else None)
        create_fn("ST_AsBinary", 1, lambda *a: a[0] if a else None)
    except Exception:
        pass
