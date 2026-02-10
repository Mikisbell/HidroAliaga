"""
Routers de Reportes - H-Redes Perú
Endpoints para exportación de reportes y archivos
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import io
import base64
from datetime import datetime

from app.db.database import get_async_session
from app.db.models import (
    Proyecto, Nudo, Tramo, Calculo, Optimizacion
)
from app.config.settings import settings


router = APIRouter()


@router.get("/{proyecto_id}/expediente")
async def generar_expediente(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Genera un expediente técnico completo del proyecto
    
    Incluye:
    - Memoria descriptiva
    - Cuadro de nudos
    - Cuadro de tramos
    - Resumen de iteraciones
    - Validación normativa
    """
    # Obtener proyecto
    proyecto_query = select(Proyecto).where(Proyecto.id == proyecto_id)
    proyecto_result = await session.execute(proyecto_query)
    proyecto = proyecto_result.scalar_one_or_none()
    
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Obtener nudos
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()
    
    # Obtener tramos
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()
    
    # Obtener último cálculo
    calculo_query = (
        select(Calculo)
        .where(Calculo.proyecto_id == proyecto_id)
        .order_by(Calculo.created_at.desc())
        .limit(1)
    )
    calculo_result = await session.execute(calculo_query)
    calculo = calculo_result.scalar_one_or_none()
    
    # Generar memoria descriptiva
    memoria = _generar_memoria_descriptiva(proyecto, nudos, tramos, calculo)
    
    return {
        "expediente": {
            "titulo": f"Expediente Técnico - {proyecto.nombre}",
            "fecha_generacion": datetime.utcnow().isoformat(),
            "memoria_descriptiva": memoria,
            "cuadro_nudos": [
                {
                    "codigo": n.codigo,
                    "tipo": n.tipo.value if hasattr(n.tipo, 'value') else str(n.tipo),
                    "elevacion": n.elevacion,
                    "demanda": n.demanda_base,
                    "presion": n.presion_calc,
                    "coordenadas": {
                        "lat": n.latitud,
                        "lng": n.longitud
                    }
                }
                for n in nudos
            ],
            "cuadro_tramos": [
                {
                    "codigo": t.codigo,
                    "nudo_origen": next((n.codigo for n in nudos if n.id == t.nudo_origen_id), None),
                    "nudo_destino": next((n.codigo for n in nudos if n.id == t.nudo_destino_id), None),
                    "longitud": t.longitud,
                    "diametro": t.diametro_interior,
                    "material": t.material.value if hasattr(t.material, 'value') else str(t.material),
                    "caudal": t.caudal,
                    "velocidad": t.velocidad
                }
                for t in tramos
            ],
            "resumen_calculo": {
                "metodo": calculo.metodo if calculo else None,
                "iteraciones": calculo.iteraciones_realizadas if calculo else None,
                "convergencia": calculo.convergencia if calculo else None,
                "error_final": calculo.error_final if calculo else None,
                "presion_minima": calculo.presion_minima if calculo else None,
                "presion_maxima": calculo.presion_maxima if calculo else None,
                "velocidad_minima": calculo.velocidad_minima if calculo else None,
                "velocidad_maxima": calculo.velocidad_maxima if calculo else None
            }
        }
    }


def _generar_memoria_descriptiva(proyecto: Proyecto, nudos: List[Nudo], 
                                  tramos: List[Tramo], calculo: Calculo) -> str:
    """Genera la memoria descriptiva del proyecto"""
    
    memoria = f"""
# MEMORIA DESCRIPTIVA
## Sistema de Distribución de Agua Potable

### 1. DATOS GENERALES DEL PROYECTO

**Nombre del Proyecto:** {proyecto.nombre}
**Ubicación:** {proyecto.departamento} - {proyecto.provincia} - {proyecto.distrito}
**Ámbito:** {proyecto.ambito.value if hasattr(proyecto.ambito, 'value') else proyecto.ambito}
**Tipo de Red:** {proyecto.tipo_red.value if hasattr(proyecto.tipo_red, 'value') else proyecto.tipo_red}
**Normativa Aplicable:** {proyecto.norma_aplicable}

### 2. PARÁMETROS DE DISEÑO

**Población de Diseño:** {proyecto.poblacion_diseno} habitantes
**Período de Diseño:** {proyecto.periodo_diseno} años
**Dotación Per Cápita:** {proyecto.dotacion_percapita} l/hab/día
**Coeficiente de Cobertura:** {proyecto.coef_cobertura}

### 3. DESCRIPCIÓN DE LA RED

**Número de Nudos:** {len(nudos)}
**Número de Tramos:** {len(tramos)}

### 4. RESULTADOS DEL ANÁLISIS HIDRÁULICO

**Método de Análisis:** {calculo.metodo if calculo else 'No ejecutado'}
**Iteraciones:** {calculo.iteraciones_realizadas if calculo else 0}
**Convergencia:** {'Sí' if calculo and calculo.convergencia else 'No'}

| Parámetro | Valor | Unidad |
|-----------|-------|--------|
| Presión Mínima | {calculo.presion_minima if calculo else 'N/A'} | m.c.a. |
| Presión Máxima | {calculo.presion_maxima if calculo else 'N/A'} | m.c.a. |
| Velocidad Mínima | {calculo.velocidad_minima if calculo else 'N/A'} | m/s |
| Velocidad Máxima | {calculo.velocidad_maxima if calculo else 'N/A'} | m/s |

---
*Generado por H-Redes Perú*
"""
    
    return memoria


@router.get("/{proyecto_id}/excel")
async def exportar_excel(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Exporta los datos del proyecto en formato Excel compatible con plantillas existentes
    """
    # Obtener datos del proyecto
    proyecto_query = select(Proyecto).where(Proyecto.id == proyecto_id)
    proyecto_result = await session.execute(proyecto_query)
    proyecto = proyecto_result.scalar_one_or_none()
    
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()
    
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()
    
    # Estructura compatible con plantilla Excel
    data = {
        "proyecto": {
            "nombre": proyecto.nombre,
            "departamento": proyecto.departamento,
            "provincia": proyecto.provincia,
            "distrito": proyecto.distrito,
            "ambito": proyecto.ambito.value if hasattr(proyecto.ambito, 'value') else proyecto.ambito,
            "tipo_red": proyecto.tipo_red.value if hasattr(proyecto.tipo_red, 'value') else proyecto.tipo_red,
            "poblacion": proyecto.poblacion_diseno,
            "dotacion": proyecto.dotacion_percapita
        },
        "nudos": [
            {
                "codigo": n.codigo,
                "tipo": n.tipo.value if hasattr(n.tipo, 'value') else str(n.tipo),
                "elevacion": n.elevacion,
                "demanda": n.demanda_base,
                "cota_terreno": n.cota_terreno,
                "latitud": n.latitud,
                "longitud": n.longitud
            }
            for n in nudos
        ],
        "tramos": [
            {
                "codigo": t.codigo,
                "nudo_origen": next((n.codigo for n in nudos if n.id == t.nudo_origen_id), None),
                "nudo_destino": next((n.codigo for n in nudos if n.id == t.nudo_destino_id), None),
                "longitud": t.longitud,
                "diametro": t.diametro_interior,
                "material": t.material.value if hasattr(t.material, 'value') else str(t.material),
                "c": t.coef_hazen_williams
            }
            for t in tramos
        ]
    }
    
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=hredes_proyecto_{proyecto_id}.json"
        }
    )


@router.get("/{proyecto_id}/epanet")
async def exportar_epanet(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Exporta el proyecto en formato .inp compatible con EPANET
    """
    proyecto_query = select(Proyecto).where(Proyecto.id == proyecto_id)
    proyecto_result = await session.execute(proyecto_query)
    proyecto = proyecto_result.scalar_one_or_none()
    
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()
    
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()
    
    # Generar archivo EPANET INP
    lines = []
    lines.append("[TITLE]")
    lines.append(f"H-Redes Perú - {proyecto.nombre}")
    lines.append("")
    lines.append("[JUNCTIONS]")
    lines.append(";ID\tElevation\tDemand\tPattern")
    
    for nudo in nudos:
        elev = nudo.elevacion or 0
        dem = nudo.demanda_base or 0
        lines.append(f"{nudo.codigo}\t{elev:.2f}\t{dem:.4f}\t")
    
    lines.append("")
    lines.append("[RESERVOIRS]")
    lines.append(";ID\tElevation\tPattern")
    
    for nudo in nudos:
        if nudo.tipo.value == "reservorio" if hasattr(nudo.tipo, 'value') else nudo.tipo == "reservorio":
            elev = nudo.elevacion or 0
            lines.append(f"{nudo.codigo}\t{elev:.2f}\t")
    
    lines.append("")
    lines.append("[TANKS]")
    lines.append(";ID\tElevation\tMinLevel\tMaxLevel\tDiameter\tMinVol\tCurveID")
    # Tanques se pueden agregar si existen
    
    lines.append("")
    lines.append("[PIPES]")
    lines.append(";ID\tNode1\tNode2\tLength\tDiameter\tRoughness\tMinorLoss\tStatus")
    
    for tramo in tramos:
        diam_mm = tramo.diametro_interior
        diam_inch = diam_mm / 25.4  # Convertir a pulgadas
        long = tramo.longitud
        c = tramo.coef_hazen_williams
        # EPANET usa factor de rugosidad diferente
        roughness = 1000 / c  # Conversión aproximada
        lines.append(f"{tramo.codigo}\t{tramo.nudo_origen_id}\t{tramo.nudo_destino_id}\t{long:.2f}\t{diam_inch:.3f}\t{roughness:.4f}\t0\tOpen")
    
    lines.append("")
    lines.append("[COORDS]")
    lines.append(";Node\tX\tY")
    
    for nudo in nudos:
        if nudo.longitud and nudo.latitud:
            # Simplificación: usar coordenadas directas
            lines.append(f"{nudo.codigo}\t{nudo.longitud:.6f}\t{nudo.latitud:.6f}")
    
    lines.append("")
    lines.append("[END]")
    
    contenido = "\n".join(lines)
    
    return Response(
        content=contenido,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=hredes_{proyecto_id}.inp"
        }
    )


@router.get("/{proyecto_id}/geojson")
async def exportar_geojson(
    proyecto_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Exporta la red en formato GeoJSON para GIS
    """
    # Reutilizar endpoint de proyectos
    from app.routers.proyectos import router as proyectos_router
    
    # Simplified implementation
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()
    
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()
    
    features = []
    
    # Features de nudos
    for nudo in nudos:
        if nudo.longitud and nudo.latitud:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [nudo.longitud, nudo.latitud]
                },
                "properties": {
                    "id": str(nudo.id),
                    "codigo": nudo.codigo,
                    "tipo": nudo.tipo.value if hasattr(nudo.tipo, 'value') else str(nudo.tipo),
                    "elevacion": nudo.elevacion,
                    "demanda": nudo.demanda_base,
                    "presion": nudo.presion_calc
                }
            })
    
    # Features de tramos
    for tramo in tramos:
        nudo_origen = next((n for n in nudos if n.id == tramo.nudo_origen_id), None)
        nudo_destino = next((n for n in nudos if n.id == tramo.nudo_destino_id), None)
        
        if nudo_origen and nudo_destino and nudo_origen.longitud and nudo_destino.longitud:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [nudo_origen.longitud, nudo_origen.latitud],
                        [nudo_destino.longitud, nudo_destino.latitud]
                    ]
                },
                "properties": {
                    "id": str(tramo.id),
                    "codigo": tramo.codigo,
                    "longitud": tramo.longitud,
                    "diametro": tramo.diametro_interior,
                    "material": tramo.material.value if hasattr(tramo.material, 'value') else str(tramo.material),
                    "caudal": tramo.caudal,
                    "velocidad": tramo.velocidad
                }
            })
    
    geojson = {
        "type": "FeatureCollection",
        "features": features,
        "crs": {
            "type": "name",
            "properties": {
                "name": settings.DEFAULT_CRS
            }
        }
    }
    
    return Response(
        content=json.dumps(geojson, indent=2),
        media_type="application/geo+json",
        headers={
            "Content-Disposition": f"attachment; filename=hredes_{proyecto_id}.geojson"
        }
    )
