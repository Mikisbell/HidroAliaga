"""
Pydantic Schemas - H-Redes Perú
Validación de datos para API REST
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from enum import Enum


# ============ ENUMS ============


class TipoRedEnum(str, Enum):
    """Tipos de red de distribución"""

    ABIERTA = "abierta"
    CERRADA = "cerrada"
    MIXTA = "mixta"


class AmbitoEnum(str, Enum):
    """Ámbito de aplicación"""

    URBANO = "urbano"
    RURAL = "rural"


class TipoNudoEnum(str, Enum):
    """Tipos de nudos"""

    CISTERNA = "cisterna"
    TANQUE_ELEVADO = "tanque_elevado"
    UNION = "union"
    CONSUMO = "consumo"
    VALVULA = "valvula"
    BOMBA = "bomba"
    RESERVORIO = "reservorio"


class TipoTramoEnum(str, Enum):
    """Tipos de tramos"""

    TUBERIA = "tuberia"
    VALVULA = "valvula"
    BOMBA = "bomba"
    ACCESORIO = "accesorio"


class MaterialEnum(str, Enum):
    """Materiales de tuberías"""

    PVC = "pvc"
    HDPE = "hdpe"
    HDDE = "hdde"
    CONCRETO = "concreto"
    ACERO = "acero"
    COBRE = "cobre"


# ============ PROYECTO ============


class ProyectoBase(BaseModel):
    """Base para Proyecto"""

    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    ambito: AmbitoEnum = AmbitoEnum.URBANO
    tipo_red: TipoRedEnum = TipoRedEnum.CERRADA


class ProyectoCreate(ProyectoBase):
    """Schema para crear proyecto"""

    departamento: Optional[str] = None
    provincia: Optional[str] = None
    distrito: Optional[str] = None
    poblacion_diseno: Optional[int] = Field(None, ge=0)
    periodo_diseno: int = Field(20, ge=1, le=50)
    dotacion_percapita: float = Field(169.0, ge=0)
    coef_cobertura: float = Field(0.8, ge=0, le=1.0)


class ProyectoUpdate(BaseModel):
    """Schema para actualizar proyecto"""

    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    descripcion: Optional[str] = None
    ambito: Optional[AmbitoEnum] = None
    tipo_red: Optional[TipoRedEnum] = None
    poblacion_diseno: Optional[int] = Field(None, ge=0)
    dotacion_percapita: Optional[float] = Field(None, ge=0)


class ProyectoResponse(ProyectoBase):
    """Schema de respuesta para proyecto"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    departamento: Optional[str]
    provincia: Optional[str]
    distrito: Optional[str]
    poblacion_diseno: Optional[int]
    periodo_diseno: int
    dotacion_percapita: float
    coef_cobertura: float
    estado: str
    version: int
    created_at: datetime
    updated_at: datetime


# ============ NUDO ============


class NudoBase(BaseModel):
    """Base para Nudo"""

    codigo: str = Field(..., min_length=1, max_length=50)
    nombre: Optional[str] = None
    tipo: TipoNudoEnum = TipoNudoEnum.UNION


class NudoCreate(NudoBase):
    """Schema para crear nudo"""

    longitud: Optional[float] = None
    latitud: Optional[float] = None
    cota_terreno: Optional[float] = None
    cota_lamina: Optional[float] = None
    demanda_base: float = 0.0
    elevacion: float = 0.0
    es_critico: bool = False


class NudoUpdate(BaseModel):
    """Schema para actualizar nudo"""

    nombre: Optional[str] = None
    tipo: Optional[TipoNudoEnum] = None
    cota_terreno: Optional[float] = None
    cota_lamina: Optional[float] = None
    demanda_base: Optional[float] = None
    elevacion: Optional[float] = None
    es_critico: Optional[bool] = None


class NudoResponse(NudoBase):
    """Schema de respuesta para nudo"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    proyecto_id: UUID
    longitud: Optional[float]
    latitud: Optional[float]
    cota_terreno: Optional[float]
    cota_lamina: Optional[float]
    demanda_base: float
    elevacion: float
    presion_calc: Optional[float]
    es_critico: bool
    created_at: datetime
    updated_at: datetime


# ============ TRAMO ============


class TramoBase(BaseModel):
    """Base para Tramo"""

    codigo: str = Field(..., min_length=1, max_length=50)
    nombre: Optional[str] = None
    tipo: TipoTramoEnum = TipoTramoEnum.TUBERIA


class TramoCreate(BaseModel):
    """Schema para crear tramo"""

    codigo: str = Field(..., min_length=1, max_length=50)
    nombre: Optional[str] = None
    tipo: TipoTramoEnum = TipoTramoEnum.TUBERIA
    nudo_origen_id: UUID
    nudo_destino_id: UUID
    longitud: float = Field(..., gt=0)
    material: MaterialEnum = MaterialEnum.PVC
    diametro_interior: float = Field(..., gt=0)
    clase_tuberia: str = "CL-10"
    coef_hazen_williams: float = Field(150.0, gt=0)


class TramoUpdate(BaseModel):
    """Schema para actualizar tramo"""

    nombre: Optional[str] = None
    tipo: Optional[TipoTramoEnum] = None
    longitud: Optional[float] = Field(None, gt=0)
    material: Optional[MaterialEnum] = None
    diametro_interior: Optional[float] = Field(None, gt=0)
    clase_tuberia: Optional[str] = None


class TramoResponse(TramoBase):
    """Schema de respuesta para tramo"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    proyecto_id: UUID
    nudo_origen_id: UUID
    nudo_destino_id: UUID
    longitud: float
    material: MaterialEnum
    diametro_interior: float
    diametro_comercial: float
    perdida_carga: Optional[float]
    caudal: Optional[float]
    velocidad: Optional[float]
    created_at: datetime
    updated_at: datetime


# ============ CÁLCULO ============


class CalculoRequest(BaseModel):
    """Request para cálculo hidráulico"""

    metodo: str = Field("hardy_cross", pattern="^(hardy_cross|deterministico|hibrido)$")
    tolerancia: float = Field(1e-7, gt=0, le=1e-3)
    max_iteraciones: int = Field(1000, ge=1, le=10000)


class IteracionItem(BaseModel):
    """Item de iteración para tabla académica"""

    iteracion: int
    malla_id: Optional[str] = None
    tramo_codigo: str
    delta_q: float
    error_acumulado: float
    convergencia: bool


class CalculoResponse(BaseModel):
    """Response de cálculo hidráulico"""

    id: UUID
    proyecto_id: UUID
    metodo: str
    tolerancia: float
    convergencia: bool
    error_final: Optional[float]
    iteraciones_realizadas: Optional[int]
    tiempo_calculo: Optional[float]

    # Resultados resumidos
    presion_minima: Optional[float]
    presion_maxima: Optional[float]
    velocidad_minima: Optional[float]
    velocidad_maxima: Optional[float]

    # Tabla de iteraciones
    iteraciones: List[IteracionItem] = []

    # Validación
    validacion_passed: bool
    alertas: List[str] = []

    created_at: datetime


# ============ OPTIMIZACIÓN ============


class OptimizacionRequest(BaseModel):
    """Request para optimización de diámetros"""

    algoritmo: str = Field(
        "algoritmo_genetico", pattern="^(algoritmo_genetico|gradiente)$"
    )
    poblacion_size: int = Field(100, ge=10, le=500)
    generaciones: int = Field(50, ge=10, le=200)
    crossover_rate: float = Field(0.8, ge=0, le=1)
    mutation_rate: float = Field(0.1, ge=0, le=1)
    costo_material: float = Field(1.0, ge=0)


class OptimizacionResponse(BaseModel):
    """Response de optimización"""

    id: UUID
    proyecto_id: UUID
    algoritmo: str
    convergencia: bool
    costo_total: float
    costo_optimizado: float
    ahorro_porcentaje: float
    generaciones: Optional[int]
    tiempo_optimizacion: Optional[float]
    diametros_propuestos: Dict[str, float]
    created_at: datetime


# ============ GIS ============


class GISConfig(BaseModel):
    """Configuración para GIS"""

    usar_dem: bool = True
    servicio_dem: str = "open-elevation"
    crs_salida: str = "EPSG:4326"
    estilo_mapa: str = "default"


class CotaAutoRequest(BaseModel):
    """Request para obtener cotas automáticas"""

    nudos: List[UUID]
    usar_cache: bool = True


class GeoJSONFeature(BaseModel):
    """Feature GeoJSON"""

    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class RedGeoJSON(BaseModel):
    """Red en formato GeoJSON"""

    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


# ============ NORMATIVA ============


class ConsultaNormativa(BaseModel):
    """Consulta al copiloto normativo"""

    pregunta: str = Field(..., min_length=10)
    contexto_adicional: Optional[str] = None
    usar_rag: bool = True


class RespuestaNormativa(BaseModel):
    """Respuesta del copiloto"""

    respuesta: str
    referencias: List[Dict[str, str]] = []
    normas_aplicables: List[str] = []
    confidence_score: float


# ============ REPORTE ============


class ReporteRequest(BaseModel):
    """Request para generar reporte"""

    tipo_reporte: str = Field(..., pattern="^(pdf|excel|epanetinp|geojson)$")
    incluye_iteraciones: bool = True
    incluye_planos: bool = True


class ReporteResponse(BaseModel):
    """Response de reporte"""

    download_url: str
    filename: str
    tamano_archivo: int
    tipo_reporte: str
    created_at: datetime


# ============ ALERTAS ============


class AlertaItem(BaseModel):
    """Item de alerta"""

    tipo: str
    severidad: str
    parametro: str
    valor_actual: float
    limite: float
    unidad: str
    mensaje: str
    sugerencia: Optional[str] = None


class ValidacionResponse(BaseModel):
    """Response de validación"""

    passed: bool
    total_verificaciones: int
    passed_verificaciones: int
    failed_verificaciones: int
    alertas: List[AlertaItem] = []
