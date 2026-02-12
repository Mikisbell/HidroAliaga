"""
Routers de Optimización - H-Redes Perú
Endpoints para optimización de diámetros con Algoritmo Genético y autenticación
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_async_session
from app.db.models import Proyecto, Tramo, Nudo, Optimizacion
from app.schemas.schemas import OptimizacionRequest, OptimizacionResponse
from app.core.optimizador import OptimizadorGA
from app.core.auth import UserAuth, get_current_active_user
from app.dependencies.auth import verify_project_owner
from app.config.settings import settings


router = APIRouter()


@router.post("/{proyecto_id}/optimizar", response_model=OptimizacionResponse)
async def optimizar_diametros(
    proyecto_id: UUID,
    request: OptimizacionRequest,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Ejecuta la optimización de diámetros usando Algoritmo Genético.

    Verifica que el usuario sea propietario del proyecto.

    El algoritmo busca la combinación de diámetros comerciales que:
    1. Cumpla con todas las presiones mínimas normativas
    2. Minimice el costo total de la red
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    # Obtener proyecto
    proyecto_query = select(Proyecto).where(Proyecto.id == proyecto_id)
    proyecto_result = await session.execute(proyecto_query)
    proyecto = proyecto_result.scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )

    # Obtener nudos
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos_db = nudos_result.scalars().all()

    if not nudos_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El proyecto no tiene nudos definidos",
        )

    # Obtener tramos
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos_db = tramos_result.scalars().all()

    if not tramos_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El proyecto no tiene tramos definidos",
        )

    # Preparar datos para el optimizador
    nudos_dict = {}
    for nudo in nudos_db:
        nudos_dict[nudo.id] = {
            "codigo": nudo.codigo,
            "tipo": nudo.tipo.value if hasattr(nudo.tipo, "value") else str(nudo.tipo),
            "elevacion": nudo.elevacion or 0.0,
            "demanda": nudo.demanda_base or 0.0,
        }

    tramos_dict = {}
    for tramo in tramos_db:
        tramos_dict[tramo.id] = {
            "codigo": tramo.codigo,
            "nudo_origen": tramo.nudo_origen_id,
            "nudo_destino": tramo.nudo_destino_id,
            "longitud": tramo.longitud,
            "diametro_actual": tramo.diametro_interior,
            "material": tramo.material.value
            if hasattr(tramo.material, "value")
            else str(tramo.material),
        }

    # Determinar presión mínima según ámbito
    if proyecto.ambito.value == "urbano":
        presion_minima = settings.PRESION_MINIMA_URBANA
    else:
        presion_minima = settings.PRESION_MINIMA_RURAL

    # Crear optimizador
    optimizador = OptimizadorGA(
        nudos=nudos_dict,
        tramos=tramos_dict,
        diametros_comerciales=settings.DIAMETROS_COMERCIALES,
        costo_por_metro=100.0,  # Soles por metro
        presion_minima=presion_minima,
        poblacion_size=request.poblacion_size,
        generaciones=request.generaciones,
        crossover_rate=request.crossover_rate,
        mutation_rate=request.mutation_rate,
    )

    # Ejecutar optimización
    resultados = optimizador.optimizar()

    # Calcular costo total de la solución original
    costo_original = 0.0
    for tramo in tramos_db:
        factor_costo = (
            tramo.diametro_interior / settings.DIAMETROS_COMERCIALES[0]
        ) ** 1.5
        costo_original += tramo.longitud * 100.0 * factor_costo

    # Guardar resultado en BD
    optimizacion_db = Optimizacion(
        proyecto_id=proyecto_id,
        algoritmo=request.algoritmo,
        parametros_ga={
            "poblacion_size": request.poblacion_size,
            "generaciones": request.generaciones,
            "crossover_rate": request.crossover_rate,
            "mutation_rate": request.mutation_rate,
        },
        costo_total=costo_original,
        costo_optimizado=resultados["costo_total"],
        ahorro_porcentaje=(
            (costo_original - resultados["costo_total"]) / costo_original * 100
        )
        if costo_original > 0
        else 0,
        convergencia=resultados["convergencia"],
        generaciones=resultados["generaciones"],
        tiempo_optimizacion=resultados["tiempo_optimizacion"],
        diametros_optimizados=resultados["diametros_propuestos"],
    )
    session.add(optimizacion_db)
    await session.commit()
    await session.refresh(optimizacion_db)

    # Actualizar tramos con diámetros optimizados
    diametros_propuestos = resultados["diametros_propuestos"]
    for tramo in tramos_db:
        if tramo.id in diametros_propuestos:
            tramo.diametro_comercial = diametros_propuestos[tramo.id]

    await session.commit()

    return OptimizacionResponse(
        id=optimizacion_db.id,
        proyecto_id=proyecto_id,
        algoritmo=request.algoritmo,
        convergencia=resultados["convergencia"],
        costo_total=costo_original,
        costo_optimizado=resultados["costo_total"],
        ahorro_porcentaje=(
            (costo_original - resultados["costo_total"]) / costo_original * 100
        )
        if costo_original > 0
        else 0,
        generaciones=resultados["generaciones"],
        tiempo_optimizacion=resultados["tiempo_optimizacion"],
        diametros_propuestos={str(k): v for k, v in diametros_propuestos.items()},
        created_at=optimizacion_db.created_at,
    )


@router.get("/{proyecto_id}/resultados")
async def obtener_resultados_optimizacion(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene los últimos resultados de optimización.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = (
        select(Optimizacion)
        .where(Optimizacion.proyecto_id == proyecto_id)
        .order_by(Optimizacion.created_at.desc())
        .limit(1)
    )
    result = await session.execute(query)
    optimizacion = result.scalar_one_or_none()

    if not optimizacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron optimizaciones para este proyecto",
        )

    return {
        "id": optimizacion.id,
        "algoritmo": optimizacion.algoritmo,
        "convergencia": optimizacion.convergencia,
        "costo_total": optimizacion.costo_total,
        "costo_optimizado": optimizacion.costo_optimizado,
        "ahorro_porcentaje": optimizacion.ahorro_porcentaje,
        "generaciones": optimizacion.generaciones,
        "tiempo_optimizacion": optimizacion.tiempo_optimizacion,
        "parametros_ga": optimizacion.parametros_ga,
        "diametros_optimizados": optimizacion.diametros_optimizados,
        "created_at": optimizacion.created_at,
    }


@router.get("/{proyecto_id}/recomendaciones")
async def obtener_recomendaciones(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene recomendaciones de cambios de diámetros.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = (
        select(Optimizacion)
        .where(Optimizacion.proyecto_id == proyecto_id)
        .order_by(Optimizacion.created_at.desc())
        .limit(1)
    )
    result = await session.execute(query)
    optimizacion = result.scalar_one_or_none()

    if not optimizacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron optimizaciones para este proyecto",
        )

    # Obtener tramos
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos_db = tramos_result.scalars().all()

    recomendaciones = []
    diametros_opt = optimizacion.diametros_optimizados

    for tramo in tramos_db:
        if str(tramo.id) in diametros_opt:
            diametro_actual = tramo.diametro_interior
            diametro_opt = diametros_opt[str(tramo.id)]

            if abs(diametro_opt - diametro_actual) > 1:
                cambio = "aumentar" if diametro_opt > diametro_actual else "reducir"
                diferencia = abs(diametro_opt - diametro_actual)

                recomendaciones.append(
                    {
                        "tramo_codigo": tramo.codigo,
                        "diametro_actual": diametro_actual,
                        "diametro_propuesto": diametro_opt,
                        "diferencia": diferencia,
                        "accion": cambio,
                        "porcentaje_cambio": round(
                            (diferencia / diametro_actual) * 100, 1
                        ),
                    }
                )

    return {
        "recomendaciones": recomendaciones,
        "total_recomendaciones": len(recomendaciones),
        "ahorro_estimado": optimizacion.ahorro_porcentaje,
    }
