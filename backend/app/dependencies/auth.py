"""
Dependencias de Autorización - HidroAliaga
Verificación de permisos y propiedad de recursos
"""

from uuid import UUID
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.auth import UserAuth, get_current_user, get_current_active_user
from app.db.database import get_async_session
from app.db.models import Proyecto


class AuthorizationError(HTTPException):
    """Excepción para errores de autorización"""

    def __init__(self, detail: str = "No autorizado"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class AuthenticationError(HTTPException):
    """Excepción para errores de autenticación"""

    def __init__(self, detail: str = "No autenticado"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_project(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> tuple[UserAuth, Optional[Proyecto]]:
    """
    Obtiene el usuario actual y verifica que el proyecto exista

    Returns:
        Tuple de (usuario, proyecto)

    Raises:
        HTTPException: Si el proyecto no existe o no pertenece al usuario
    """
    # Buscar el proyecto
    query = select(Proyecto).where(Proyecto.id == proyecto_id)
    result = await session.execute(query)
    proyecto = result.scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )

    # Verificar propiedad (o si es admin)
    if not current_user.is_admin and proyecto.usuario_id != current_user.id:
        raise AuthorizationError("No tienes permiso para acceder a este proyecto")

    return current_user, proyecto


async def verify_project_owner(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Proyecto:
    """
    Verifica que el usuario actual sea el propietario del proyecto

    Returns:
        Proyecto: El proyecto si el usuario es propietario

    Raises:
        HTTPException: Si no es propietario o el proyecto no existe
    """
    # Buscar el proyecto
    query = select(Proyecto).where(Proyecto.id == proyecto_id)
    result = await session.execute(query)
    proyecto = result.scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )

    # Verificar propiedad
    if not current_user.is_admin and proyecto.usuario_id != current_user.id:
        raise AuthorizationError("No tienes permiso para modificar este proyecto")

    return proyecto


async def require_project_owner(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    """
    Dependency que verifica propiedad sin retornar el proyecto

    Uso:
        @router.delete("/{proyecto_id}", dependencies=[Depends(require_project_owner)])
    """
    await verify_project_owner(proyecto_id, current_user, session)


def require_admin(
    current_user: UserAuth = Depends(get_current_active_user),
) -> UserAuth:
    """
    Verifica que el usuario sea administrador

    Raises:
        AuthorizationError: Si el usuario no es admin
    """
    if not current_user.is_admin:
        raise AuthorizationError("Esta acción requiere permisos de administrador")
    return current_user


async def get_user_projects_query(
    current_user: UserAuth = Depends(get_current_active_user),
):
    """
    Retorna el filtro base para consultas de proyectos del usuario

    Returns:
        Filtro SQL para usuario_id
    """
    return Proyecto.usuario_id == current_user.id
