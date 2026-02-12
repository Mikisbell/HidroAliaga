"""
Dependencias de la aplicación
"""

from app.dependencies.auth import (
    AuthorizationError,
    AuthenticationError,
    get_current_user_with_project,
    verify_project_owner,
    require_project_owner,
    require_admin,
    get_user_projects_query,
)

__all__ = [
    "AuthorizationError",
    "AuthenticationError",
    "get_current_user_with_project",
    "verify_project_owner",
    "require_project_owner",
    "require_admin",
    "get_user_projects_query",
]
