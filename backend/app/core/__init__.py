"""Core modules"""

from app.core.hidraulico import MotorHidraulico, Nudo, Tramo, Malla
from app.core.optimizador import OptimizadorGA, Individuo
from app.core.normativa import CopilotoNormativo, BaseConocimientoNormativo
from app.core.auth import (
    UserAuth,
    verify_supabase_token,
    get_current_user,
    get_current_active_user,
    require_auth,
)

__all__ = [
    "MotorHidraulico",
    "Nudo",
    "Tramo",
    "Malla",
    "OptimizadorGA",
    "Individuo",
    "CopilotoNormativo",
    "BaseConocimientoNormativo",
    "UserAuth",
    "verify_supabase_token",
    "get_current_user",
    "get_current_active_user",
    "require_auth",
]
