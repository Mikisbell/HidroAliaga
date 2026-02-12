"""
Módulo de Autenticación - HidroAliaga
Validación de tokens JWT de Supabase Auth
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
import jwt
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from app.config.settings import settings

# Esquema de seguridad para bearer tokens
security = HTTPBearer(auto_error=False)


class UserAuth(BaseModel):
    """Modelo de usuario autenticado"""

    id: UUID
    email: str
    role: str = "authenticated"
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def is_admin(self) -> bool:
        """Verifica si el usuario es administrador"""
        return self.role == "admin" or self.app_metadata.get("role") == "admin"

    class Config:
        """Configuración de Pydantic"""

        arbitrary_types_allowed = True

    def __repr__(self):
        return f"<UserAuth(id={self.id}, email={self.email}, role={self.role})>"


async def verify_supabase_token(token: str) -> UserAuth:
    """
    Verifica un token JWT de Supabase Auth

    Args:
        token: Token JWT del header Authorization

    Returns:
        UserAuth: Objeto de usuario autenticado

    Raises:
        HTTPException: Si el token es inválido o expiró
    """
    try:
        # Decodificar el token usando el secret de Supabase
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": True, "verify_exp": True},
        )

        # Extraer datos del usuario del payload
        user_id = payload.get("sub")
        email = payload.get("email", "")
        role = payload.get("role", "authenticated")
        app_metadata = payload.get("app_metadata", {})
        user_metadata = payload.get("user_metadata", {})

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: falta user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return UserAuth(
            id=UUID(user_id),
            email=email,
            role=role,
            app_metadata=app_metadata,
            user_metadata=user_metadata,
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error de autenticación: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    request: Request, credentials: HTTPAuthorizationCredentials = None
) -> Optional[UserAuth]:
    """
    Obtiene el usuario actual desde el token JWT

    Esta función se usa como dependency en FastAPI endpoints
    """
    # Si no hay credenciales en el parámetro, intentar obtener del header
    if credentials is None:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            if settings.REQUIRE_AUTH:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No se proporcionó token de autenticación",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None

        # Parsear el header Authorization
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Header de autorización inválido. Formato: Bearer <token>",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = parts[1]
    else:
        token = credentials.credentials

    return await verify_supabase_token(token)


async def get_current_active_user(current_user: UserAuth = None) -> UserAuth:
    """
    Obtiene el usuario actual y verifica que esté activo

    Raises:
        HTTPException: Si no hay usuario autenticado
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


async def require_auth():
    """
    Dependency que requiere autenticación

    Uso:
        @router.get("/", dependencies=[Depends(require_auth)])
    """

    async def _require_auth(
        request: Request, credentials: HTTPAuthorizationCredentials = None
    ):
        return await get_current_user(request, credentials)

    return _require_auth
