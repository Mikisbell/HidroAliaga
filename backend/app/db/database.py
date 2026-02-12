"""
Configuración de Base de Datos - H-Redes Perú
PostgreSQL con extensión PostGIS
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.config.settings import settings


# Engine asíncrono para PostgreSQL
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

# Engine síncrono para operaciones específicas
from sqlalchemy import create_engine

sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,
)

# Sesiones
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

SyncSessionLocal = sessionmaker(sync_engine, autocommit=False, autoflush=False)

SyncSessionLocal = sessionmaker(sync_engine, autocommit=False, autoflush=False)

# Base declarativa
Base = declarative_base()


async def get_async_session() -> AsyncSession:
    """Dependencia para obtener sesión asíncrona"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_session():
    """Obtiene sesión síncrona"""
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()


async def init_db():
    """Inicializa la base de datos"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Cierra las conexiones"""
    await async_engine.dispose()
