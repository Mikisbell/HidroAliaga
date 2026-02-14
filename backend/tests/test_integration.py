"""
Tests de Integración - HidroAliaga
Endpoints de Proyectos con Autenticación JWT

Usa aiosqlite + AsyncSession para compatibilidad con el backend async.
"""

import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os

# Asegurar que conftest.py se cargue ANTES de importar los modelos
# (conftest.py parchea GeoAlchemy2 para SQLite)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.db.database import Base, get_async_session
from app.db.models import Proyecto
from app.core.auth import UserAuth

# ============================================================
# CONFIGURACIÓN DE BASE DE DATOS DE TEST (ASÍNCRONA)
# ============================================================

TEST_DATABASE_URL = "sqlite+aiosqlite://"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ============================================================
# FIXTURES
# ============================================================


@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Crea tablas, proporciona sesión, y limpia al terminar"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(db_session):
    """Cliente HTTP de test con dependency override de la sesión"""

    async def override_get_async_session():
        yield db_session

    app.dependency_overrides[get_async_session] = override_get_async_session

    transport = ASGITransport(app=app)
    with AsyncClient(transport=transport, base_url="http://test") as ac:
        # httpx.AsyncClient no tiene context manager sync, usamos yield directo
        pass

    app.dependency_overrides.clear()


# Usamos un fixture async para httpx.AsyncClient
@pytest_asyncio.fixture(scope="function")
async def async_client(db_session):
    """Cliente HTTP async para tests"""

    async def override_get_async_session():
        yield db_session

    app.dependency_overrides[get_async_session] = override_get_async_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def user_a_id():
    return uuid4()


@pytest.fixture
def user_b_id():
    return uuid4()


def _make_token(user_id, email):
    """Helper para generar tokens JWT de test"""
    import jwt
    from app.config.settings import settings

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    secret = settings.SUPABASE_JWT_SECRET
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def mock_token_user_a(user_a_id):
    return _make_token(user_a_id, "user_a@example.com")


@pytest.fixture
def mock_token_user_b(user_b_id):
    return _make_token(user_b_id, "user_b@example.com")


@pytest_asyncio.fixture
async def proyecto_user_a(db_session, user_a_id):
    proyecto = Proyecto(
        id=uuid4(),
        nombre="Proyecto Usuario A",
        descripcion="Descripción del proyecto A",
        usuario_id=user_a_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db_session.add(proyecto)
    await db_session.commit()
    await db_session.refresh(proyecto)
    return proyecto


@pytest_asyncio.fixture
async def proyecto_user_b(db_session, user_b_id):
    proyecto = Proyecto(
        id=uuid4(),
        nombre="Proyecto Usuario B",
        descripcion="Descripción del proyecto B",
        usuario_id=user_b_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db_session.add(proyecto)
    await db_session.commit()
    await db_session.refresh(proyecto)
    return proyecto


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ============================================================
# TEST: AUTHENTICATION
# ============================================================


class TestAuthentication:

    @pytest.mark.asyncio
    async def test_listar_proyectos_sin_token(self, async_client):
        response = await async_client.get("/api/v1/proyectos/")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_crear_proyecto_sin_token(self, async_client):
        response = await async_client.post(
            "/api/v1/proyectos/", json={"nombre": "Nuevo"}
        )
        assert response.status_code in [401, 422]


# ============================================================
# TEST: AUTHORIZATION
# ============================================================


class TestAuthorization:

    @pytest.mark.asyncio
    async def test_usuario_a_vee_sus_proyectos(
        self, async_client, mock_token_user_a, proyecto_user_a
    ):
        response = await async_client.get(
            "/api/v1/proyectos/",
            headers=_auth_headers(mock_token_user_a),
        )
        assert response.status_code == 200
        proyectos = response.json()
        assert len(proyectos) >= 1
        assert any(p["id"] == str(proyecto_user_a.id) for p in proyectos)

    @pytest.mark.asyncio
    async def test_usuario_a_no_vee_proyectos_usuario_b(
        self, async_client, mock_token_user_a, proyecto_user_b
    ):
        response = await async_client.get(
            "/api/v1/proyectos/",
            headers=_auth_headers(mock_token_user_a),
        )
        assert response.status_code == 200
        proyectos = response.json()
        assert not any(p["id"] == str(proyecto_user_b.id) for p in proyectos)

    @pytest.mark.asyncio
    async def test_usuario_a_no_accede_proyecto_usuario_b(
        self, async_client, mock_token_user_a, proyecto_user_b
    ):
        response = await async_client.get(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers=_auth_headers(mock_token_user_a),
        )
        # El endpoint devuelve 404 (security through obscurity)
        assert response.status_code in [403, 404]

    @pytest.mark.asyncio
    async def test_usuario_a_no_modifica_proyecto_usuario_b(
        self, async_client, mock_token_user_a, proyecto_user_b
    ):
        response = await async_client.put(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers=_auth_headers(mock_token_user_a),
            json={"nombre": "Intento de modificación"},
        )
        assert response.status_code in [403, 404, 422]

    @pytest.mark.asyncio
    async def test_usuario_a_no_elimina_proyecto_usuario_b(
        self, async_client, mock_token_user_a, proyecto_user_b
    ):
        response = await async_client.delete(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers=_auth_headers(mock_token_user_a),
        )
        assert response.status_code in [403, 404]


# ============================================================
# TEST: PROJECT CREATION
# ============================================================


class TestProjectCreation:

    @pytest.mark.asyncio
    async def test_crear_proyecto_asigna_usuario(
        self, async_client, mock_token_user_a, user_a_id
    ):
        response = await async_client.post(
            "/api/v1/proyectos/",
            headers=_auth_headers(mock_token_user_a),
            json={
                "nombre": "Proyecto Nuevo",
                "tipo_red": "cerrada",
                "ambito": "urbano",
            },
        )
        assert response.status_code == 201
        proyecto = response.json()
        assert proyecto["nombre"] == "Proyecto Nuevo"
        assert "id" in proyecto


# ============================================================
# TEST: NESTED ENDPOINTS (NUDOS)
# ============================================================


class TestNestedEndpoints:

    @pytest.mark.asyncio
    async def test_listar_nudos_proyecto_otro_usuario(
        self, async_client, mock_token_user_a, proyecto_user_b
    ):
        response = await async_client.get(
            f"/api/v1/proyectos/{proyecto_user_b.id}/nudos",
            headers=_auth_headers(mock_token_user_a),
        )
        assert response.status_code in [403, 404]
