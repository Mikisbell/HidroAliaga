"""
Routers de Cálculos Hidráulicos - H-Redes Perú
Endpoints para cálculos y validación con autenticación
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
import time

from app.db.database import get_async_session
from app.db.models import Proyecto, Nudo, Tramo, Calculo, Iteracion, Alerta
from app.schemas.schemas import (
    CalculoRequest,
    CalculoResponse,
    IteracionItem,
    ValidacionResponse,
    AlertaItem,
)
from app.core.hidraulico import MotorHidraulico
from app.core.auth import UserAuth, get_current_active_user
from app.dependencies.auth import verify_project_owner
from app.config.settings import settings


router = APIRouter()


@router.post("/{proyecto_id}/calcular", response_model=CalculoResponse)
async def calcular_hidraulico(
    proyecto_id: UUID,
    request: CalculoRequest,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Ejecuta el cálculo hidráulico para un proyecto.

    Verifica que el usuario sea propietario del proyecto.
    Utiliza el método de Hardy Cross para redes cerradas,
    cálculo determinístico para redes abiertas, o híbrido para redes mixtas.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    start_time = time.time()

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

    # Convertir a estructuras del motor
    nudos_dict = {
        n.id: Nudo(
            id=n.id,
            codigo=n.codigo,
            tipo=n.tipo.value if hasattr(n.tipo, "value") else str(n.tipo),
            elevacion=n.elevacion or 0.0,
            demanda=n.demanda_base or 0.0,
        )
        for n in nudos_db
    }

    tramos_dict = {
        t.id: Tramo(
            id=t.id,
            codigo=t.codigo,
            nudo_origen_id=t.nudo_origen_id,
            nudo_destino_id=t.nudo_destino_id,
            longitud=t.longitud,
            diametro=t.diametro_interior,
            material=t.material.value
            if hasattr(t.material, "value")
            else str(t.material),
            coef_hazen_williams=t.coef_hazen_williams or 150.0,
            n_origen=settings.HAZEN_WILLIAMS_EXPONENT,
        )
        for t in tramos_db
    }

    # Crear motor hidráulico
    motor = MotorHidraulico(
        nudos=nudos_dict,
        tramos=tramos_dict,
        tolerancia=request.tolerancia,
        max_iteraciones=request.max_iteraciones,
        coef_hazen_williams=settings.HAZEN_WILLIAMS_CONSTANT,
        exponente_hw=settings.HAZEN_WILLIAMS_EXPONENT,
    )

    # Ejecutar cálculo según método
    if request.metodo == "hardy_cross":
        convergencia, error = motor.metodo_hardy_cross()
    elif request.metodo == "deterministico":
        motor.calcular_red_abierta()
        convergencia, error = True, 0.0
    else:  # hibrido
        convergencia, error = motor.calcular_hibrido()

    # Obtener resultados
    resumen = motor.obtener_resumen_resultados()
    tabla_iteraciones = motor.generar_tabla_iteraciones()

    # Guardar cálculo en BD
    calculo = Calculo(
        proyecto_id=proyecto_id,
        metodo=request.metodo,
        tolerancia=request.tolerancia,
        max_iteraciones=request.max_iteraciones,
        convergencia=convergencia,
        error_final=error,
        iteraciones_realizadas=resumen["iteraciones_realizadas"],
        tiempo_calculo=time.time() - start_time,
        presion_minima=resumen["presion_minima"],
        presion_maxima=resumen["presion_maxima"],
        velocidad_minima=resumen["velocidad_minima"],
        velocidad_maxima=resumen["velocidad_maxima"],
        iteraciones_data=tabla_iteraciones,
        validacion_passed=False,
    )
    session.add(calculo)
    await session.commit()
    await session.refresh(calculo)

    # Guardar iteraciones individuales
    for item in tabla_iteraciones:
        iteracion = Iteracion(
            calculo_id=calculo.id,
            iteracion_numero=item["iteracion"],
            error_acumulado=item["error_maximo"],
            convergencia_alcanzada=item["convergencia"],
        )
        session.add(iteracion)

    await session.commit()

    # Crear respuesta
    iteraciones_response = [
        IteracionItem(
            iteracion=i["iteracion"],
            delta_q=i["delta_q_total"],
            error_acumulado=i["error_maximo"],
            convergencia=i["convergencia"],
        )
        for i in tabla_iteraciones
    ]

    return CalculoResponse(
        id=calculo.id,
        proyecto_id=proyecto_id,
        metodo=request.metodo,
        tolerancia=request.tolerancia,
        convergencia=convergencia,
        error_final=error,
        iteraciones_realizadas=resumen["iteraciones_realizadas"],
        tiempo_calculo=calculo.tiempo_calculo,
        presion_minima=resumen["presion_minima"],
        presion_maxima=resumen["presion_maxima"],
        velocidad_minima=resumen["velocidad_minima"],
        velocidad_maxima=resumen["velocidad_maxima"],
        iteraciones=iteraciones_response,
        validacion_passed=False,
        alertas=[],
        created_at=calculo.created_at,
    )


@router.get("/{proyecto_id}/resultados")
async def obtener_resultados(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene los últimos resultados de cálculo.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = (
        select(Calculo)
        .where(Calculo.proyecto_id == proyecto_id)
        .order_by(Calculo.created_at.desc())
        .limit(1)
    )
    result = await session.execute(query)
    calculo = result.scalar_one_or_none()

    if not calculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron cálculos para este proyecto",
        )

    return {
        "id": calculo.id,
        "metodo": calculo.metodo,
        "convergencia": calculo.convergencia,
        "error_final": calculo.error_final,
        "presion_minima": calculo.presion_minima,
        "presion_maxima": calculo.presion_maxima,
        "velocidad_minima": calculo.velocidad_minima,
        "velocidad_maxima": calculo.velocidad_maxima,
        "iteraciones_data": calculo.iteraciones_data,
        "created_at": calculo.created_at,
    }


@router.post("/{proyecto_id}/validar", response_model=ValidacionResponse)
async def validar_proyecto(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Valida el proyecto según las reglas de negocio.

    Verifica que el usuario tenga acceso al proyecto.
    Valida:
    - Presión mínima y máxima
    - Velocidad mínima y máxima
    - Diámetros mínimos
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

    # Obtener último cálculo
    calculo_query = (
        select(Calculo)
        .where(Calculo.proyecto_id == proyecto_id)
        .order_by(Calculo.created_at.desc())
        .limit(1)
    )
    calculo_result = await session.execute(calculo_query)
    calculo = calculo_result.scalar_one_or_none()

    # Parámetros según ámbito
    if proyecto.ambito.value == "urbano":
        presion_min = settings.PRESION_MINIMA_URBANA
        presion_max = settings.PRESION_ESTATICA_MAXIMA
        diametro_min = settings.DIAMETRO_MINIMO_URBANO
    else:
        presion_min = settings.PRESION_MINIMA_RURAL
        presion_max = settings.PRESION_ESTATICA_MAXIMA
        diametro_min = settings.DIAMETRO_MINIMO_RURAL

    vel_min = settings.VELOCIDAD_MINIMA
    vel_max = settings.VELOCIDAD_MAXIMA

    alertas = []
    verificaciones_passed = 0
    verificaciones_total = 0

    # Obtener nudos y tramos
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()

    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()

    # Validar presiones en nudos
    for nudo in nudos:
        if nudo.presion_calc is not None:
            verificaciones_total += 1

            if nudo.presion_calc < presion_min:
                alertas.append(
                    AlertaItem(
                        tipo="presion",
                        severidad="critica",
                        parametro="Presión",
                        valor_actual=round(nudo.presion_calc, 2),
                        limite=presion_min,
                        unidad="m.c.a.",
                        mensaje=f"Nudo {nudo.codigo}: Presión insuficiente ({nudo.presion_calc:.2f} < {presion_min} m.c.a.)",
                        sugerencia="Aumentar diámetro de tramos alimentadores o verificar cota del reservorio",
                    )
                )
            elif nudo.presion_calc > presion_max:
                alertas.append(
                    AlertaItem(
                        tipo="presion",
                        severidad="warning",
                        parametro="Presión Estática",
                        valor_actual=round(nudo.presion_calc, 2),
                        limite=presion_max,
                        unidad="m.c.a.",
                        mensaje=f"Nudo {nudo.codigo}: Presión estática máxima excedida ({nudo.presion_calc:.2f} > {presion_max} m.c.a.)",
                        sugerencia="Considerar instalación de válvula reductora de presión (VRP)",
                    )
                )
            else:
                verificaciones_passed += 1

    # Validar velocidades en tramos
    for tramo in tramos:
        verificaciones_total += 1

        if tramo.velocidad is not None:
            if tramo.velocidad > vel_max:
                alertas.append(
                    AlertaItem(
                        tipo="velocidad",
                        severidad="critica",
                        parametro="Velocidad",
                        valor_actual=round(tramo.velocidad, 2),
                        limite=vel_max,
                        unidad="m/s",
                        mensaje=f"Tramo {tramo.codigo}: Velocidad máxima excedida ({tramo.velocidad:.2f} > {vel_max} m/s)",
                        sugerencia="Aumentar diámetro para reducir velocidad y evitar golpe de ariete",
                    )
                )
            elif tramo.velocidad < vel_min and tramo.velocidad > 0:
                alertas.append(
                    AlertaItem(
                        tipo="velocidad",
                        severidad="warning",
                        parametro="Velocidad",
                        valor_actual=round(tramo.velocidad, 2),
                        limite=vel_min,
                        unidad="m/s",
                        mensaje=f"Tramo {tramo.codigo}: Velocidad mínima ({tramo.velocidad:.2f} < {vel_min} m/s)",
                        sugerencia="Riesgo de sedimentación. Considerar aumentar caudal o disminuir diámetro",
                    )
                )
            else:
                verificaciones_passed += 1

    # Validar diámetros
    for tramo in tramos:
        verificaciones_total += 1

        if tramo.diametro_interior < diametro_min:
            alertas.append(
                AlertaItem(
                    tipo="diametro",
                    severidad="critica",
                    parametro="Diámetro",
                    valor_actual=tramo.diametro_interior,
                    limite=diametro_min,
                    unidad="mm",
                    mensaje=f"Tramo {tramo.codigo}: Diámetro menor al mínimo normativo ({tramo.diametro_interior} < {diametro_min} mm)",
                    sugerencia="Seleccionar diámetro comercial mayor",
                )
            )
        else:
            verificaciones_passed += 1

    # Guardar alertas en BD
    passed = verificaciones_passed == verificaciones_total

    for alerta in alertas:
        db_alerta = Alerta(
            proyecto_id=proyecto_id,
            tipo_alerta=alerta.tipo,
            severidad=alerta.severidad,
            parametro=alerta.parametro,
            valor_actual=alerta.valor_actual,
            valor_minimo=alerta.limite if alerta.severidad == "critica" else None,
            valor_maximo=alerta.limite if alerta.severidad == "warning" else None,
            unidad=alerta.unidad,
            mensaje=alerta.mensaje,
            sugerencia=alerta.sugerencia,
        )
        session.add(db_alerta)

    await session.commit()

    return ValidacionResponse(
        passed=passed,
        total_verificaciones=verificaciones_total,
        passed_verificaciones=verificaciones_passed,
        failed_verificaciones=verificaciones_total - verificaciones_passed,
        alertas=alertas,
    )


@router.get("/{proyecto_id}/iteraciones")
async def obtener_iteraciones(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene la tabla de iteraciones para transparencia académica.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = (
        select(Calculo)
        .where(Calculo.proyecto_id == proyecto_id)
        .order_by(Calculo.created_at.desc())
        .limit(1)
    )
    result = await session.execute(query)
    calculo = result.scalar_one_or_none()

    if not calculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron cálculos para este proyecto",
        )

    return {
        "iteraciones": calculo.iteraciones_data,
        "convergencia": calculo.convergencia,
        "error_final": calculo.error_final,
    }
