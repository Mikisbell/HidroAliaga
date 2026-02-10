"""
Routers GIS - H-Redes Perú
Endpoints para integración con servicios de mapas y cotas DEM
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.db.database import get_async_session
from app.db.models import Proyecto, Nudo
from app.config.settings import settings


router = APIRouter()


class CotaResponse(BaseModel):
    """Respuesta de cota"""
    nudo_id: UUID
    codigo: str
    cota_terreno: float
    cota_source: str


@router.get("/{proyecto_id}/cotas")
async def obtener_cotas_proyecto(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Obtiene las cotas de terreno de todos los nudos del proyecto
    """
    query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    nudos = result.scalars().all()
    
    if not nudos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron nudos para este proyecto"
        )
    
    return {
        "nudos": [
            {
                "id": str(n.id),
                "codigo": n.codigo,
                "longitud": n.longitud,
                "latitud": n.latitud,
                "cota_terreno": n.cota_terreno,
                "cota_source": n.cota_source
            }
            for n in nudos
        ]
    }


@router.post("/{proyecto_id}/cotas/desdem")
async def obtener_cotas_dem(
    proyecto_id: UUID,
    usar_cache: bool = True,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Obtiene cotas de terreno desde servicios DEM (Modelos Digitales de Elevación)
    
    Conecta con servicios como:
    - Open-Elevation API
    - AWS Terrain Tiles
    - SRTM Data
    """
    query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    nudos = result.scalars().all()
    
    if not nudos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron nudos para este proyecto"
        )
    
    # Filtrar nudos sin cota
    nudos_sin_cota = [n for n in nudos if not n.cota_terreno and n.longitud and n.latitud]
    
    if not nudos_sin_cota:
        return {
            "mensaje": "Todos los nudos ya tienen cotas definidas",
            "nudos_actualizados": 0
        }
    
    # Preparar coordenadas para la API
    coordenadas = [
        {"latitude": n.latitud, "longitude": n.longitud}
        for n in nudos_sin_cota
    ]
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                settings.ELEVATION_API_URL,
                json={"locations": coordenadas}
            )
            
            if response.status_code == 200:
                data = response.json()
                elevaciones = data.get("results", [])
                
                # Actualizar cotas
                actualizados = 0
                for i, nudo in enumerate(nudos_sin_cota):
                    if i < len(elevaciones):
                        elevacion = elevaciones[i].get("elevation", 0)
                        nudo.cota_terreno = elevacion
                        nudo.cota_source = "dem_api"
                        actualizados += 1
                
                await session.commit()
                
                return {
                    "mensaje": "Cotas actualizadas desde DEM",
                    "nudos_actualizados": actualizados,
                    "servicio": settings.ELEVATION_API_URL
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error consultando servicio DEM"
                )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo cotas: {str(e)}"
        )


@router.post("/{proyecto_id}/cotas/interpolar")
async def interpolar_cotas(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Interpola cotas de terreno para nudos sin información
    
    Usa método de interpolación IDW (Inverse Distance Weighting)
    basado en nudos vecinos con cotas conocidas
    """
    query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    nudos = result.scalars().all()
    
    if not nudos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron nudos para este proyecto"
        )
    
    # Separar nudos con y sin cota
    nudos_con_cota = [n for n in nudos if n.cota_terreno and n.longitud and n.latitud]
    nudos_sin_cota = [n for n in nudos if not n.cota_terreno and n.longitud and n.latitud]
    
    if not nudos_con_cota:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay nudos con cotas para usar como referencia"
        )
    
    # Interpolar para cada nudo sin cota
    actualizados = 0
    for nudo in nudos_sin_cota:
        cota_interpolada = _interpolar_idw(
            nudo.longitud, 
            nudo.latitud,
            nudos_con_cota
        )
        
        if cota_interpolada is not None:
            nudo.cota_terreno = cota_interpolada
            nudo.cota_source = "interpolacion"
            actualizados += 1
    
    await session.commit()
    
    return {
        "mensaje": "Cotas interpoladas",
        "metodo": "IDW (Inverse Distance Weighting)",
        "nudos_actualizados": actualizados
    }


def _interpolar_idw(lon: float, lat: float, nudos_referencia: List[Nudo], power: float = 2) -> Optional[float]:
    """
    Interpola usando Inverse Distance Weighting
    
    Args:
    - lon, lat: Coordenadas del punto a interpolar
    - nudos_referencia: Nudos con cota conocida
    - power: Potencia para ponderación (default 2)
    
    Returns:
    - Cota interpolada o None si no es posible
    """
    if not nudos_referencia:
        return None
    
    numerador = 0.0
    denominador = 0.0
    
    for nudo in nudos_referencia:
        if nudo.longitud is None or nudo.latitud is None or nudo.cota_terreno is None:
            continue
        
        # Calcular distancia
        distancia = _calcular_distancia(
            lon, lat,
            nudo.longitud, nudo.latitud
        )
        
        if distancia == 0:
            return nudo.cota_terreno
        
        # Ponderación
        peso = 1.0 / (distancia ** power)
        numerador += peso * nudo.cota_terreno
        denominador += peso
    
    if denominador == 0:
        return None
    
    return numerador / denominador


def _calcular_distancia(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """
    Calcula distancia entre dos puntos (aproximación cartesiana para distancias cortas)
    """
    # Diferencias
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    
    # Aproximación: 1 grado ≈ 111 km en latitud, menos en longitud según latitud
    lat_promedio = (lat1 + lat2) / 2
    factor_longitud = 111.32 * cos(lat_promedio * 3.14159 / 180)
    
    # Distancia en km
    distancia = sqrt((dlat * 111.0) ** 2 + (dlon * factor_longitud) ** 2)
    
    return distancia


from math import cos, sqrt


@router.get("/{proyecto_id}/mapa-calor")
async def obtener_mapa_calor(
    proyecto_id: UUID,
    tipo: str = "presion",
    session: AsyncSession = Depends(get_async_session)
):
    """
    Genera datos para mapa de calor
    
    Tipos disponibles:
    - presion: Presión en nudos
    - velocidad: Velocidad en tramos
    - cota: Cota de terreno
    """
    query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(query)
    nudos = nudos_result.scalars().all()
    
    tramos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    # This should be Tramo, not Nudo
    from app.db.models import Tramo
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()
    
    if not nudos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron nudos para este proyecto"
        )
    
    datos = []
    
    if tipo == "presion":
        for nudo in nudos:
            if nudo.longitud and nudo.latitud:
                datos.append({
                    "lat": nudo.latitud,
                    "lng": nudo.longitud,
                    "valor": nudo.presion_calc or 0,
                    "codigo": nudo.codigo
                })
    elif tipo == "cota":
        for nudo in nudos:
            if nudo.longitud and nudo.latitud:
                datos.append({
                    "lat": nudo.latitud,
                    "lng": nudo.longitud,
                    "valor": nudo.cota_terreno or 0,
                    "codigo": nudo.codigo
                })
    elif tipo == "velocidad":
        for tramo in tramos:
            # Buscar coordenadas de nudos
            # Simplified - would need actual coordinate lookup
            pass
    
    return {
        "tipo": tipo,
        "datos": datos,
        "rango": {
            "minimo": min(d["valor"] for d in datos) if datos else 0,
            "maximo": max(d["valor"] for d in datos) if datos else 0
        }
    }
