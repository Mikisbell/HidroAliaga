"""
Tests Unitarios - Sistema de Autenticación y Autorización
"""

import pytest
from uuid import uuid4, UUID
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.auth import (
    UserAuth,
    verify_supabase_token,
    get_current_user,
    get_current_active_user,
)
from app.dependencies.auth import (
    AuthorizationError,
    AuthenticationError,
    verify_project_owner,
)
from app.config.settings import settings


class TestUserAuth:
    """Tests para el modelo UserAuth"""

    def test_user_auth_creation(self):
        """Test creación de UserAuth"""
        user_id = uuid4()
        user = UserAuth(id=user_id, email="test@example.com", role="authenticated")

        assert user.id == user_id
        assert user.email == "test@example.com"
        assert user.role == "authenticated"
        assert not user.is_admin

    def test_user_admin_detection(self):
        """Test detección de usuario admin"""
        # Usuario normal
        user_normal = UserAuth(
            id=uuid4(), email="user@example.com", role="authenticated"
        )
        assert not user_normal.is_admin

        # Usuario admin por role
        user_admin = UserAuth(id=uuid4(), email="admin@example.com", role="admin")
        assert user_admin.is_admin

        # Usuario admin por app_metadata
        user_admin_meta = UserAuth(
            id=uuid4(),
            email="admin2@example.com",
            role="authenticated",
            app_metadata={"role": "admin"},
        )
        assert user_admin_meta.is_admin


class TestTokenVerification:
    """Tests para verificación de tokens JWT"""

    @pytest.fixture
    def valid_token_payload(self):
        """Genera un payload válido para tests"""
        return {
            "sub": str(uuid4()),
            "email": "test@example.com",
            "role": "authenticated",
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow(),
        }

    @pytest.fixture
    def valid_token(self, valid_token_payload):
        """Genera un token JWT válido para tests"""
        # Para tests, usar un secret conocido
        test_secret = "test-secret-key-for-testing-only"
        token = jwt.encode(valid_token_payload, test_secret, algorithm="HS256")
        return token, test_secret, valid_token_payload

    @pytest.mark.asyncio
    async def test_verify_valid_token(self, monkeypatch, valid_token):
        """Test verificación de token válido"""
        token, test_secret, payload = valid_token

        # Mock del settings
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", test_secret)

        user = await verify_supabase_token(token)

        assert isinstance(user, UserAuth)
        assert str(user.id) == payload["sub"]
        assert user.email == payload["email"]
        assert user.role == payload["role"]

    @pytest.mark.asyncio
    async def test_verify_expired_token(self, monkeypatch):
        """Test verificación de token expirado"""
        test_secret = "test-secret-key-for-testing-only"
        expired_payload = {
            "sub": str(uuid4()),
            "email": "test@example.com",
            "exp": datetime.utcnow() - timedelta(hours=1),  # Expirado
            "iat": datetime.utcnow() - timedelta(hours=2),
        }

        token = jwt.encode(expired_payload, test_secret, algorithm="HS256")
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", test_secret)

        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token(token)

        assert exc_info.value.status_code == 401
        assert "expirado" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_verify_invalid_token(self, monkeypatch):
        """Test verificación de token inválido"""
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", "correct-secret")

        # Token firmado con secret incorrecto
        wrong_payload = {"sub": str(uuid4()), "email": "test@example.com"}
        wrong_token = jwt.encode(wrong_payload, "wrong-secret", algorithm="HS256")

        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token(wrong_token)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_verify_token_without_sub(self, monkeypatch):
        """Test verificación de token sin user ID"""
        test_secret = "test-secret-key-for-testing-only"
        payload = {
            "email": "test@example.com",
            "exp": datetime.utcnow() + timedelta(hours=1),
            # Falta "sub"
        }

        token = jwt.encode(payload, test_secret, algorithm="HS256")
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", test_secret)

        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token(token)

        assert exc_info.value.status_code == 401
        # El mensaje exacto puede variar, pero debe indicar error
        assert "autenticación" in exc_info.value.detail.lower() or "authentication" in exc_info.value.detail.lower()


class TestAuthorizationErrors:
    """Tests para excepciones de autorización"""

    def test_authorization_error(self):
        """Test creación de AuthorizationError"""
        error = AuthorizationError("No tienes permiso")

        assert error.status_code == 403
        assert error.detail == "No tienes permiso"

    def test_authentication_error(self):
        """Test creación de AuthenticationError"""
        error = AuthenticationError("Token inválido")

        assert error.status_code == 401
        assert error.detail == "Token inválido"
        assert "WWW-Authenticate" in error.headers


class TestGetCurrentActiveUser:
    """Tests para get_current_active_user"""

    @pytest.mark.asyncio
    async def test_get_active_user_success(self):
        """Test obtención de usuario activo exitosa"""
        user = UserAuth(id=uuid4(), email="test@example.com", role="authenticated")

        result = await get_current_active_user(user)

        assert result == user

    @pytest.mark.asyncio
    async def test_get_active_user_none(self):
        """Test obtención de usuario activo sin usuario"""
        with pytest.raises(HTTPException) as exc_info:
            await get_current_active_user(None)

        assert exc_info.value.status_code == 401


class TestSecurityEdgeCases:
    """Tests para casos edge de seguridad"""

    def test_user_auth_repr(self):
        """Test representación string de UserAuth"""
        user_id = uuid4()
        user = UserAuth(id=user_id, email="test@example.com", role="admin")

        repr_str = repr(user)
        assert str(user_id) in repr_str
        assert "test@example.com" in repr_str
        assert "admin" in repr_str

    @pytest.mark.asyncio
    async def test_malformed_token(self, monkeypatch):
        """Test token malformado"""
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", "secret")

        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token("not.a.valid.token")

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_empty_token(self, monkeypatch):
        """Test token vacío"""
        monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", "secret")

        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token("")

        assert exc_info.value.status_code == 401


# ============================================================
# FIXTURES GLOBALES
# ============================================================


@pytest.fixture
def mock_user():
    """Fixture para usuario mock"""
    return UserAuth(id=uuid4(), email="test@example.com", role="authenticated")


@pytest.fixture
def mock_admin_user():
    """Fixture para usuario admin mock"""
    return UserAuth(id=uuid4(), email="admin@example.com", role="admin")
