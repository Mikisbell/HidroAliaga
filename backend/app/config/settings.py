"""
Configuración del Sistema HidroAliaga
"""

import os
from pathlib import Path
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # Aplicación
    APP_NAME: str = "HidroAliaga"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
    ]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""  # Secret para validar tokens JWT

    # Base de Datos
    DATABASE_URL: str = ""
    DATABASE_URL_SYNC: str = ""

    # Seguridad
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días
    REQUIRE_AUTH: bool = True  # Forzar autenticación en todos los endpoints

    # PostGIS
    POSTGIS_ENABLED: bool = True

    # Motor Hidráulico
    HARDY_CROSS_TOLERANCE: float = 1e-7
    MAX_ITERATIONS: int = 1000

    # Hazen-Williams
    HAZEN_WILLIAMS_EXPONENT: float = 1.852
    HAZEN_WILLIAMS_CONSTANT: float = 10.674

    # Normativa Peruana
    PRESION_MINIMA_URBANA: float = 10.0  # m.c.a. (RNE OS.050)
    PRESION_MINIMA_RURAL: float = 5.0  # m.c.a. (RM 192-2018)
    PRESION_MINIMA_PILETAS: float = 3.5  # m.c.a. (RM 192-2018)
    VELOCIDAD_MAXIMA: float = 3.0  # m/s
    VELOCIDAD_MINIMA: float = 0.6  # m/s
    DIAMETRO_MINIMO_URBANO: float = 75.0  # mm (3 pulgadas)
    DIAMETRO_MINIMO_RURAL: float = 25.0  # mm (1 pulgada)
    PRESION_ESTATICA_MAXIMA: float = 50.0  # m.c.a.

    # Dotaciones (lppd - litros por persona por día)
    DOTACION_CLIMA_CALIDO: float = 169.0
    DOTACION_CLIMA_TEMPLADO: float = 155.0
    DOTACION_CLIMA_FRIO: float = 129.0

    # Algoritmo Genético
    GA_POBLACION_SIZE: int = 100
    GA_GENERACIONES: int = 50
    GA_CROSSOVER_RATE: float = 0.8
    GA_MUTATION_RATE: float = 0.1

    # Diámetros Comerciales (mm)
    DIAMETROS_COMERCIALES: List[float] = [
        20,
        25,
        32,
        40,
        50,
        63,
        75,
        90,
        110,
        125,
        160,
        200,
        250,
        315,
        400,
    ]

    # GIS
    DEFAULT_CRS: str = "EPSG:4326"
    ELEVATION_API_URL: str = "https://api.open-elevation.com/api/v1/lookup"

    # LLM/Normativa (Moonshot Kimi K2.5)
    LLM_MODEL: str = "kimi-k2.5"
    LLM_API_KEY: str = ""
    LLM_PROVEEDOR: str = "moonshot"  # "moonshot" o "openai"
    MOONSHOT_API_KEY: str = ""  # Alternativa nombre de variable

    # OpenAI (Opcional)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"

    # Exportación
    EXPORT_PATH: Path = Path("./exports")
    TEMPLATE_PATH: Path = Path("./templates")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Permitir variables extra en .env


@lru_cache()
def get_settings() -> Settings:
    """Obtiene la configuración cacheada"""
    return Settings()


settings = get_settings()
