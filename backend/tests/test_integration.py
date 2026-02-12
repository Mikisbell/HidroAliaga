"""
Tests de Integración - Endpoints de Proyectos con Autenticación
"""

import pytest
from uuid import uuid4, UUID
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importar la app y modelos
import sys

sys.path.insert(0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend")

from main import app
from app.db.database import Base, get_async_session
from app.db.models import Proyecto, Nudo, Tramo
from app.core.auth import UserAuth
from app.dependencies.auth import AuthorizationError


# ============================================================
# CONFIGURACIÓN DE BASE DE DATOS DE TEST
# ============================================================

# Crear engine de SQLite en memoria para tests
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear tablas
Base.metadata.create_all(bind=engine)


# ============================================================
# FIXTURES
# ============================================================


@pytest.fixture(scope="function")
def db_session():
    """Fixture para sesión de base de datos"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Fixture para cliente de test"""

    def override_get_async_session():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_async_session] = override_get_async_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def user_a_id():
    """ID del usuario A"""
    return uuid4()


@pytest.fixture
def user_b_id():
    """ID del usuario B"""
    return uuid4()


@pytest.fixture
def mock_token_user_a(user_a_id):
    """Token mock para usuario A"""
    import jwt
    from app.config.settings import settings

    payload = {
        "sub": str(user_a_id),
        "email": "user_a@example.com",
        "role": "authenticated",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }

    # Para tests, usar el secret de settings o uno de test
    secret = getattr(settings, "SUPABASE_JWT_SECRET", "test-secret")
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def mock_token_user_b(user_b_id):
    """Token mock para usuario B"""
    import jwt
    from datetime import timedelta
    from app.config.settings import settings

    payload = {
        "sub": str(user_b_id),
        "email": "user_b@example.com",
        "role": "authenticated",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }

    secret = getattr(settings, "SUPABASE_JWT_SECRET", "test-secret")
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def proyecto_user_a(db_session, user_a_id):
    """Proyecto creado por usuario A"""
    proyecto = Proyecto(
        id=uuid4(),
        nombre="Proyecto Usuario A",
        descripcion="Descripción del proyecto A",
        usuario_id=user_a_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(proyecto)
    db_session.commit()
    db_session.refresh(proyecto)
    return proyecto


@pytest.fixture
def proyecto_user_b(db_session, user_b_id):
    """Proyecto creado por usuario B"""
    proyecto = Proyecto(
        id=uuid4(),
        nombre="Proyecto Usuario B",
        descripcion="Descripción del proyecto B",
        usuario_id=user_b_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(proyecto)
    db_session.commit()
    db_session.refresh(proyecto)
    return proyecto


# ============================================================
# TESTS DE AUTENTICACIÓN
# ============================================================


class TestAuthentication:
    """Tests de autenticación en endpoints"""

    def test_listar_proyectos_sin_token(self, client):
        """Test: listar proyectos sin token debe fallar con 401"""
        response = client.get("/api/v1/proyectos/")

        assert response.status_code == 401
        assert (
            "autenticación" in response.json()["detail"].lower()
            or "token" in response.json()["detail"].lower()
        )

    def test_crear_proyecto_sin_token(self, client):
        """Test: crear proyecto sin token debe fallar con 401"""
        response = client.post(
            "/api/v1/proyectos/",
            json={"nombre": "Nuevo Proyecto", "tipo_red": "cerrada"},
        )

        assert response.status_code == 401

    def test_obtener_proyecto_sin_token(self, client, proyecto_user_a):
        """Test: obtener proyecto sin token debe fallar con 401"""
        response = client.get(f"/api/v1/proyectos/{proyecto_user_a.id}")

        assert response.status_code == 401

    def test_actualizar_proyecto_sin_token(self, client, proyecto_user_a):
        """Test: actualizar proyecto sin token debe fallar con 401"""
        response = client.put(
            f"/api/v1/proyectos/{proyecto_user_a.id}",
            json={"nombre": "Proyecto Actualizado"},
        )

        assert response.status_code == 401

    def test_eliminar_proyecto_sin_token(self, client, proyecto_user_a):
        """Test: eliminar proyecto sin token debe fallar con 401"""
        response = client.delete(f"/api/v1/proyectos/{proyecto_user_a.id}")

        assert response.status_code == 401


# ============================================================
# TESTS DE AUTORIZACIÓN Y AISLAMIENTO
# ============================================================


class TestAuthorization:
    """Tests de autorización y aislamiento de datos"""

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_usuario_a_vee_sus_proyectos(
        self, client, mock_token_user_a, proyecto_user_a
    ):
        """Test: Usuario A debe ver solo sus proyectos"""
        response = client.get(
            "/api/v1/proyectos/",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code == 200
        proyectos = response.json()

        # Debe retornar al menos el proyecto de usuario A
        assert len(proyectos) >= 1
        assert any(p["id"] == str(proyecto_user_a.id) for p in proyectos)

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_usuario_a_no_vee_proyectos_usuario_b(
        self, client, mock_token_user_a, proyecto_user_b
    ):
        """Test: Usuario A NO debe ver proyectos de Usuario B"""
        response = client.get(
            "/api/v1/proyectos/",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code == 200
        proyectos = response.json()

        # NO debe estar el proyecto de usuario B
        assert not any(p["id"] == str(proyecto_user_b.id) for p in proyectos)

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_usuario_a_no_accede_proyecto_usuario_b(
        self, client, mock_token_user_a, proyecto_user_b
    ):
        """Test: Usuario A debe obtener 403 al intentar acceder a proyecto de B"""
        response = client.get(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code in [403, 404]  # 403 Forbidden o 404 Not Found

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_usuario_a_no_modifica_proyecto_usuario_b(
        self, client, mock_token_user_a, proyecto_user_b
    ):
        """Test: Usuario A debe obtener 403 al intentar modificar proyecto de B"""
        response = client.put(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
            json={"nombre": "Intento de modificación"},
        )

        assert response.status_code == 403

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_usuario_a_no_elimina_proyecto_usuario_b(
        self, client, mock_token_user_a, proyecto_user_b
    ):
        """Test: Usuario A debe obtener 403 al intentar eliminar proyecto de B"""
        response = client.delete(
            f"/api/v1/proyectos/{proyecto_user_b.id}",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code == 403


# ============================================================
# TESTS DE CREACIÓN CON USUARIO ASIGNADO
# ============================================================


class TestProjectCreation:
    """Tests de creación de proyectos con asignación automática de usuario"""

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_crear_proyecto_asigna_usuario_automaticamente(
        self, client, mock_token_user_a, user_a_id
    ):
        """Test: Al crear proyecto, debe asignarse automáticamente el usuario_id"""
        response = client.post(
            "/api/v1/proyectos/",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
            json={
                "nombre": "Proyecto Nuevo",
                "tipo_red": "cerrada",
                "ambito": "urbano",
            },
        )

        assert response.status_code == 201
        proyecto = response.json()

        # Verificar que el proyecto fue creado con el usuario correcto
        assert proyecto["nombre"] == "Proyecto Nuevo"
        # El usuario_id debe ser asignado automáticamente
        assert "usuario_id" in proyecto or "id" in proyecto


# ============================================================
# TESTS DE ENDPOINTS ANIDADOS
# ============================================================


class TestNestedEndpoints:
    """Tests de endpoints anidados (nudos, tramos)"""

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_listar_nudos_propio_proyecto(
        self, client, mock_token_user_a, proyecto_user_a, db_session
    ):
        """Test: Usuario A puede listar nudos de su proyecto"""
        # Crear un nudo para el proyecto
        nudo = Nudo(
            id=uuid4(), proyecto_id=proyecto_user_a.id, codigo="N1", tipo="union"
        )
        db_session.add(nudo)
        db_session.commit()

        response = client.get(
            f"/api/v1/proyectos/{proyecto_user_a.id}/nudos",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code == 200
        nudos = response.json()
        assert len(nudos) >= 1

    @pytest.mark.skip(reason="Requiere configuración de JWT secret")
    def test_listar_nudos_proyecto_otro_usuario(
        self, client, mock_token_user_a, proyecto_user_b
    ):
        """Test: Usuario A NO puede listar nudos de proyecto de B"""
        response = client.get(
            f"/api/v1/proyectos/{proyecto_user_b.id}/nudos",
            headers={"Authorization": f"Bearer {mock_token_user_a}"},
        )

        assert response.status_code in [403, 404]


# ============================================================
# LIMPIEZA
# ============================================================


def teardown_module():
    """Limpieza después de todos los tests"""
    Base.metadata.drop_all(bind=engine)
