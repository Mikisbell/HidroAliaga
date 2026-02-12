"""
Routers de Proyectos - H-Redes Perú
Endpoints para gestión de proyectos con autenticación y autorización
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from sqlalchemy.orm import selectinload

from app.db.database import get_async_session
from app.db.models import Proyecto, Nudo, Tramo, Calculo
from app.schemas.schemas import (
    ProyectoCreate,
    ProyectoUpdate,
    ProyectoResponse,
    NudoCreate,
    NudoUpdate,
    NudoResponse,
    TramoCreate,
    TramoUpdate,
    TramoResponse,
    RedGeoJSON,
)
from app.core.auth import UserAuth, get_current_user, get_current_active_user
from app.dependencies.auth import verify_project_owner


router = APIRouter()


# ============ PROYECTOS ============


@router.get("/", response_model=List[ProyectoResponse])
async def listar_proyectos(
    skip: int = 0,
    limit: int = 100,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Lista los proyectos del usuario autenticado.

    Solo devuelve proyectos donde usuario_id == current_user.id
    """
    query = (
        select(Proyecto)
        .where(Proyecto.usuario_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Proyecto.updated_at.desc())
    )
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{proyecto_id}", response_model=ProyectoResponse)
async def obtener_proyecto(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene un proyecto por ID.

    Verifica que el proyecto pertenezca al usuario autenticado.
    """
    query = select(Proyecto).where(
        and_(Proyecto.id == proyecto_id, Proyecto.usuario_id == current_user.id)
    )
    result = await session.execute(query)
    proyecto = result.scalar_one_or_none()

    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado o no tienes permiso para acceder a él",
        )
    return proyecto


@router.post("/", response_model=ProyectoResponse, status_code=status.HTTP_201_CREATED)
async def crear_proyecto(
    proyecto: ProyectoCreate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Crea un nuevo proyecto.

    Automáticamente asigna el usuario_id al usuario autenticado.
    """
    proyecto_dict = proyecto.model_dump()
    proyecto_dict["usuario_id"] = current_user.id

    db_proyecto = Proyecto(**proyecto_dict)
    session.add(db_proyecto)
    await session.commit()
    await session.refresh(db_proyecto)
    return db_proyecto


@router.put("/{proyecto_id}", response_model=ProyectoResponse)
async def actualizar_proyecto(
    proyecto_id: UUID,
    proyecto_update: ProyectoUpdate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Actualiza un proyecto.

    Verifica que el usuario sea el propietario del proyecto.
    """
    # Buscar el proyecto y verificar propiedad
    query = select(Proyecto).where(
        and_(Proyecto.id == proyecto_id, Proyecto.usuario_id == current_user.id)
    )
    result = await session.execute(query)
    db_proyecto = result.scalar_one_or_none()

    if not db_proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado o no tienes permiso para modificarlo",
        )

    # Actualizar campos
    update_data = proyecto_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_proyecto, field, value)

    db_proyecto.version += 1
    await session.commit()
    await session.refresh(db_proyecto)
    return db_proyecto


@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_proyecto(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Elimina un proyecto y todos sus componentes.

    Verifica que el usuario sea el propietario antes de eliminar.
    """
    # Primero verificar que el proyecto existe y pertenece al usuario
    query = select(Proyecto).where(
        and_(Proyecto.id == proyecto_id, Proyecto.usuario_id == current_user.id)
    )
    result = await session.execute(query)
    db_proyecto = result.scalar_one_or_none()

    if not db_proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado o no tienes permiso para eliminarlo",
        )

    # Eliminar nudos, tramos y cálculos asociados
    await session.execute(delete(Nudo).where(Nudo.proyecto_id == proyecto_id))
    await session.execute(delete(Tramo).where(Tramo.proyecto_id == proyecto_id))
    await session.execute(delete(Calculo).where(Calculo.proyecto_id == proyecto_id))

    # Eliminar el proyecto
    await session.delete(db_proyecto)
    await session.commit()


# ============ NUDOS ============


@router.get("/{proyecto_id}/nudos", response_model=List[NudoResponse])
async def listar_nudos(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Lista los nudos de un proyecto.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Nudo).where(Nudo.proyecto_id == proyecto_id).order_by(Nudo.codigo)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{proyecto_id}/nudos/{nudo_id}", response_model=NudoResponse)
async def obtener_nudo(
    proyecto_id: UUID,
    nudo_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene un nudo por ID.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Nudo).where(Nudo.id == nudo_id, Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    nudo = result.scalar_one_or_none()

    if not nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Nudo no encontrado"
        )
    return nudo


@router.post(
    "/{proyecto_id}/nudos",
    response_model=NudoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_nudo(
    proyecto_id: UUID,
    nudo: NudoCreate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Crea un nuevo nudo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    nudo_dict = nudo.model_dump()
    nudo_dict["proyecto_id"] = proyecto_id
    db_nudo = Nudo(**nudo_dict)
    session.add(db_nudo)
    await session.commit()
    await session.refresh(db_nudo)
    return db_nudo


@router.put("/{proyecto_id}/nudos/{nudo_id}", response_model=NudoResponse)
async def actualizar_nudo(
    proyecto_id: UUID,
    nudo_id: UUID,
    nudo_update: NudoUpdate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Actualiza un nudo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Nudo).where(Nudo.id == nudo_id, Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    db_nudo = result.scalar_one_or_none()

    if not db_nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Nudo no encontrado"
        )

    update_data = nudo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_nudo, field, value)

    await session.commit()
    await session.refresh(db_nudo)
    return db_nudo


@router.delete("/{proyecto_id}/nudos/{nudo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_nudo(
    proyecto_id: UUID,
    nudo_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Elimina un nudo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Nudo).where(Nudo.id == nudo_id, Nudo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    db_nudo = result.scalar_one_or_none()

    if not db_nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Nudo no encontrado"
        )

    await session.delete(db_nudo)
    await session.commit()


# ============ TRAMOS ============


@router.get("/{proyecto_id}/tramos", response_model=List[TramoResponse])
async def listar_tramos(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Lista los tramos de un proyecto.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Tramo).where(Tramo.proyecto_id == proyecto_id).order_by(Tramo.codigo)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{proyecto_id}/tramos/{tramo_id}", response_model=TramoResponse)
async def obtener_tramo(
    proyecto_id: UUID,
    tramo_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene un tramo por ID.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Tramo).where(Tramo.id == tramo_id, Tramo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    tramo = result.scalar_one_or_none()

    if not tramo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tramo no encontrado"
        )
    return tramo


@router.post(
    "/{proyecto_id}/tramos",
    response_model=TramoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_tramo(
    proyecto_id: UUID,
    tramo: TramoCreate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Crea un nuevo tramo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    tramo_dict = tramo.model_dump()
    tramo_dict["proyecto_id"] = proyecto_id
    db_tramo = Tramo(**tramo_dict)
    session.add(db_tramo)
    await session.commit()
    await session.refresh(db_tramo)
    return db_tramo


@router.put("/{proyecto_id}/tramos/{tramo_id}", response_model=TramoResponse)
async def actualizar_tramo(
    proyecto_id: UUID,
    tramo_id: UUID,
    tramo_update: TramoUpdate,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Actualiza un tramo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Tramo).where(Tramo.id == tramo_id, Tramo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    db_tramo = result.scalar_one_or_none()

    if not db_tramo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tramo no encontrado"
        )

    update_data = tramo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tramo, field, value)

    await session.commit()
    await session.refresh(db_tramo)
    return db_tramo


@router.delete(
    "/{proyecto_id}/tramos/{tramo_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def eliminar_tramo(
    proyecto_id: UUID,
    tramo_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Elimina un tramo.

    Verifica que el usuario sea propietario del proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    query = select(Tramo).where(Tramo.id == tramo_id, Tramo.proyecto_id == proyecto_id)
    result = await session.execute(query)
    db_tramo = result.scalar_one_or_none()

    if not db_tramo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tramo no encontrado"
        )

    await session.delete(db_tramo)
    await session.commit()


@router.get("/{proyecto_id}/geojson", response_model=RedGeoJSON)
async def obtener_geojson(
    proyecto_id: UUID,
    current_user: UserAuth = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Obtiene la red en formato GeoJSON.

    Verifica que el usuario tenga acceso al proyecto.
    """
    # Verificar propiedad del proyecto
    await verify_project_owner(proyecto_id, current_user, session)

    # Obtener nudos
    nudos_query = select(Nudo).where(Nudo.proyecto_id == proyecto_id)
    nudos_result = await session.execute(nudos_query)
    nudos = nudos_result.scalars().all()

    # Obtener tramos
    tramos_query = select(Tramo).where(Tramo.proyecto_id == proyecto_id)
    tramos_result = await session.execute(tramos_query)
    tramos = tramos_result.scalars().all()

    features = []

    # Crear features para nudos
    for nudo in nudos:
        if nudo.longitud and nudo.latitud:
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [nudo.longitud, nudo.latitud],
                    },
                    "properties": {
                        "id": str(nudo.id),
                        "codigo": nudo.codigo,
                        "tipo": nudo.tipo.value
                        if hasattr(nudo.tipo, "value")
                        else nudo.tipo,
                        "cota_terreno": nudo.cota_terreno,
                        "demanda": nudo.demanda_base,
                    },
                }
            )

    # Crear features para tramos
    for tramo in tramos:
        origen = next((n for n in nudos if n.id == tramo.nudo_origen_id), None)
        destino = next((n for n in nudos if n.id == tramo.nudo_destino_id), None)

        if origen and destino and origen.longitud and destino.longitud:
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [origen.longitud, origen.latitud],
                            [destino.longitud, destino.latitud],
                        ],
                    },
                    "properties": {
                        "id": str(tramo.id),
                        "codigo": tramo.codigo,
                        "tipo": tramo.tipo.value
                        if hasattr(tramo.tipo, "value")
                        else tramo.tipo,
                        "longitud": tramo.longitud,
                        "diametro": tramo.diametro_interior,
                        "material": tramo.material.value
                        if hasattr(tramo.material, "value")
                        else tramo.material,
                    },
                }
            )

    return {"type": "FeatureCollection", "features": features}
