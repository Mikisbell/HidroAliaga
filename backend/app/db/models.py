"""
Modelos de Base de Datos - H-Redes Perú
Modelos SQLAlchemy con PostGIS para datos geográficos
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, 
    Text, Boolean, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID
from geoalchemy2 import Geometry
import uuid

from app.db.database import Base
from app.config.settings import settings


class TipoRed(str):
    """Tipos de red de distribución"""
    ABIERTA = "abierta"
    CERRADA = "cerrada"
    MIXTA = "mixta"


class Ambito(str):
    """Ámbito de aplicación"""
    URBANO = "urbano"
    RURAL = "rural"


class TipoNudo(str):
    """Tipos de nudos en la red"""
    CISTERNA = "cisterna"
    TANQUE_ELEVADO = "tanque_elevado"
    UNION = "union"
    CONSUMO = "consumo"
    VALVULA = "valvula"
    BOMBA = "bomba"
    RESERVORIO = "reservorio"


class TipoTramo(str):
    """Tipos de tramos en la red"""
    TUBERIA = "tuberia"
    VALVULA = "valvula"
    BOMBA = "bomba"
    ACCESORIO = "accesorio"


class MaterialTuberia(str):
    """Materiales de tuberías"""
    PVC = "pvc"
    HDPE = "hdpe"
    HDDE = "hdde"
    CONCRETO = "concreto"
    ACERO = "acero"
    COBRE = "cobre"


class Proyecto(Base):
    """Modelo de Proyecto"""
    __tablename__ = "proyectos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    
    # Contexto normativo
    ambito = Column(SQLEnum(Ambito), default=Ambito.URBANO)
    tipo_red = Column(SQLEnum(TipoRed), default=TipoRed.CERRADA)
    norma_aplicable = Column(String(100), default="RNE OS.050")
    
    # Datos del proyecto
    departamento = Column(String(100))
    provincia = Column(String(100))
    distrito = Column(String(100))
    
    # Parámetros de diseño
    poblacion_diseno = Column(Integer, default=0)
    periodo_diseno = Column(Integer, default(20))  # años
    dotacion_percapita = Column(Float, default=169.0)  # lppd
    coef_cobertura = Column(Float, default=0.8)
    
    # Coeficientes
    coef_hazen_williams = Column(Float, default=150.0)  # C para PVC
    
    # Estado
    estado = Column(String(50), default="borrador")
    version = Column(Integer, default=1)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    usuario_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Relaciones
    nudos = relationship("Nudo", back_populates="proyecto", cascade="all, delete-orphan")
    tramos = relationship("Tramo", back_populates="proyecto", cascade="all, delete-orphan")
    calculos = relationship("Calculo", back_populates="proyecto", cascade="all, delete-orphan")


class Nudo(Base):
    """Modelo de Nudo (Nudo/Junction)"""
    __tablename__ = "nudos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    
    # Identificación
    codigo = Column(String(50), nullable=False)
    nombre = Column(String(255), nullable=True)
    tipo = Column(SQLEnum(TipoNudo), default=TipoNudo.UNION)
    
    # Geometría
    coordenadas = Column(Geometry(geometry_type="POINT", srid=int(settings.DEFAULT_CRS.split(':')[1])), nullable=True)
    longitud = Column(Float, nullable=True)  # grados
    latitud = Column(Float, nullable=True)  # grados
    cota_terreno = Column(Float, nullable=True)  # m.s.n.m.
    cota_lamina = Column(Float, nullable=True)  # m (nivel de agua)
    
    # Cotas來源
    cota_source = Column(String(50), default="manual")  # manual, dem, interpolacion
    
    # Demandas
    demanda_base = Column(Float, default=0.0)  # l/s
    demanda_pattern = Column(JSONB, nullable=True)  # Patrón de variación horaria
    
    # Elevación
    elevacion = Column(Float, default=0.0)  # m (sobre el datum)
    
    # Resultados de cálculo
    presion_calc = Column(Float, nullable=True)  # m.c.a.
    presion_minima_verificada = Column(Boolean, default=True)
    
    # Configuración
    es_critico = Column(Boolean, default=False)
    notas = Column(Text, nullable=True)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    proyecto = relationship("Proyecto", back_populates="nudos")
    tramos_origen = relationship("Tramo", foreign_keys="Tramo.nudo_origen_id", back_populates="nudo_origen")
    tramos_destino = relationship("Tramo", foreign_keys="Tramo.nudo_destino_id", back_populates="nudo_destino")


class Tramo(Base):
    """Modelo de Tramo (Pipe/Link)"""
    __tablename__ = "tramos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    
    # Identificación
    codigo = Column(String(50), nullable=False)
    nombre = Column(String(255), nullable=True)
    tipo = Column(SQLEnum(TipoTramo), default=TipoTramo.TUBERIA)
    
    # Conexión
    nudo_origen_id = Column(UUID(as_uuid=True), ForeignKey("nudos.id"), nullable=False)
    nudo_destino_id = Column(UUID(as_uuid=True), ForeignKey("nudos.id"), nullable=False)
    
    # Geometría
    geometria = Column(Geometry(geometry_type="LINESTRING", srid=int(settings.DEFAULT_CRS.split(':')[1])), nullable=True)
    longitud = Column(Float, default=0.0)  # m
    
    # Tubería
    material = Column(SQLEnum(MaterialTuberia), default=MaterialTuberia.PVC)
    diametro_interior = Column(Float, default=0.0)  # mm
    diametro_comercial = Column(Float, default=0.0)  # mm (para optimización)
    clase_tuberia = Column(String(20), default="CL-10")  # Clase de presión
    
    # Coeficiente
    coef_hazen_williams = Column(Float, default=150.0)
    
    # Cálculo de pérdidas
    perdida_carga = Column(Float, nullable=True)  # m
    
    # Resultados
    caudal = Column(Float, nullable=True)  # l/s
    velocidad = Column(Float, nullable=True)  # m/s
    velocidad_verificada = Column(Boolean, default=True)
    
    # Configuración
    es_bombeo = Column(Boolean, default=False)
    curva_bomba = Column(JSONB, nullable=True)
    coeficiente_rugosidad = Column(Float, nullable=True)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    proyecto = relationship("Proyecto", back_populates="tramos")
    nudo_origen = relationship("Nudo", foreign_keys=[nudo_origen_id], back_populates="tramos_origen")
    nudo_destino = relationship("Nudo", foreign_keys=[nudo_destino_id], back_populates="tramos_destino")
    iteraciones = relationship("Iteracion", back_populates="tramo", cascade="all, delete-orphan")


class Calculo(Base):
    """Modelo de Cálculo Hidráulico"""
    __tablename__ = "calculos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    
    # Método de cálculo
    metodo = Column(String(50), nullable=False)  # hardy_cross, deterministico, hibrido
    tolerancia = Column(Float, default=settings.HARDY_CROSS_TOLERANCE)
    max_iteraciones = Column(Integer, default=settings.MAX_ITERATIONS)
    
    # Resultados
    convergencia = Column(Boolean, default=False)
    error_final = Column(Float, nullable=True)
    iteraciones_realizadas = Column(Integer, nullable=True)
    tiempo_calculo = Column(Float, nullable=True)  # segundos
    
    # Resumen
    presion_minima = Column(Float, nullable=True)
    presion_maxima = Column(Float, nullable=True)
    velocidad_minima = Column(Float, nullable=True)
    velocidad_maxima = Column(Float, nullable=True)
    
    # Datos detallados
    iteraciones_data = Column(JSONB, nullable=True)  # Tabla de iteraciones
    resultados_nudos = Column(JSONB, nullable=True)
    resultados_tramos = Column(JSONB, nullable=True)
    
    # Estado de validación
    validacion_passed = Column(Boolean, default=False)
    alertas = Column(JSONB, nullable=True)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
    version_modelo = Column(String(20), default="1.0")
    
    # Relaciones
    proyecto = relationship("Proyecto", back_populates="calculos")


class Iteracion(Base):
    """Modelo de Iteración para Transparencia Académica"""
    __tablename__ = "iteraciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tramo_id = Column(UUID(as_uuid=True), ForeignKey("tramos.id"), nullable=False)
    
    # Datos de iteración
    iteracion_numero = Column(Integer, nullable=False)
    malla_id = Column(String(50), nullable=True)
    delta_q = Column(Float, nullable=True)  # Correction de caudal
    error_acumulado = Column(Float, nullable=True)
    
    # Estado
    convergencia_alcanzada = Column(Boolean, default=False)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    tramo = relationship("Tramo", back_populates="iteraciones")


class Optimizacion(Base):
    """Modelo de Optimización de Diámetros"""
    __tablename__ = "optimizaciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    
    # Algoritmo
    algoritmo = Column(String(50), default="algoritmo_genetico")
    parametros_ga = Column(JSONB, nullable=True)
    
    # Resultados
    costo_total = Column(Float, nullable=True)
    costo_optimizado = Column(Float, nullable=True)
    ahorro_porcentaje = Column(Float, nullable=True)
    
    # Estado
    convergencia = Column(Boolean, default=False)
    generaciones = Column(Integer, nullable=True)
    mejor_individuo = Column(JSONB, nullable=True)
    
    # Métricas
    poblacion_final = Column(Integer, nullable=True)
    tiempo_optimizacion = Column(Float, nullable=True)  # segundos
    
    # Solución propuesta
    diametros_optimizados = Column(JSONB, nullable=True)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)


class Normativa(Base):
    """Base de Conocimiento Normativo"""
    __tablename__ = "normativas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50))  # norma, resolucion, decreto
    
    # Referencia
    referencia = Column(String(100))  # RNE, RM, etc.
    articulo = Column(String(100))
    seccion = Column(String(100))
    
    # Contenido
    descripcion = Column(Text, nullable=True)
    contenido = Column(Text, nullable=True)
    parametros = Column(JSONB, nullable=True)
    
    # Alcance
    ambito_aplicacion = Column(JSONB, nullable=True)  # urbano, rural, industrial
    parametros_validados = Column(JSONB, nullable=True)
    
    # Embeddings para RAG
    embedding = Column(JSONB, nullable=True)
    
    # Metadatos
    vigente = Column(Boolean, default=True)
    fecha_vigencia = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alerta(Base):
    """Modelo de Alertas de Validación"""
    __tablename__ = "alertas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos.id"), nullable=False)
    
    # Identificación
    tipo_alerta = Column(String(50), nullable=False)  # presion, velocidad, diametro
    severidad = Column(String(20))  # critica, warning, info
    
    # Detalle
    parametro = Column(String(100), nullable=False)
    valor_actual = Column(Float, nullable=True)
    valor_minimo = Column(Float, nullable=True)
    valor_maximo = Column(Float, nullable=True)
    unidad = Column(String(20), nullable=True)
    
    # Mensaje
    mensaje = Column(Text, nullable=False)
    sugerencia = Column(Text, nullable=True)
    
    # Estado
    resuelta = Column(Boolean, default=False)
    
    # Metadatos
    created_at = Column(DateTime, default=datetime.utcnow)
