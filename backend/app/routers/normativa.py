"""
Routers de Normativa - H-Redes Perú
Endpoints para consultas normativas y copiloto LLM con autenticación opcional
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.normativa import CopilotoNormativo, BaseConocimientoNormativo
from app.core.auth import UserAuth, get_current_user
from app.config.settings import settings


router = APIRouter()

# Instancia del copiloto (usa Moonshot Kimi K2.5 por defecto)
copiloto = CopilotoNormativo(
    api_key=settings.LLM_API_KEY,
    modelo=settings.LLM_MODEL,
    proveedor=settings.LLM_PROVEEDOR,
)


class ConsultaRequest(BaseModel):
    """Request para consulta normativa"""

    pregunta: str
    contexto: Optional[str] = None
    usar_rag: bool = True


class ValidacionParametroRequest(BaseModel):
    """Request para validar parámetro"""

    parametro: str
    valor: float
    unidad: str
    ambito: str = "urbano"


@router.post("/consultar")
async def consultar_normativa(
    request: ConsultaRequest,
    current_user: Optional[UserAuth] = Depends(get_current_user),
):
    """
    Consulta al copiloto normativo.

    Permite preguntar sobre:
    - Presiones mínimas y máximas
    - Velocidades en tuberías
    - Diámetros mínimos
    - Dotaciones según clima
    - Y cualquier aspecto de la normativa peruana

    Nota: Este endpoint es público pero puede usarse con autenticación
    para tracking de usuarios.
    """
    try:
        resultado = await copiloto.responder(
            pregunta=request.pregunta,
            contexto=request.contexto,
            usar_rag=request.usar_rag,
        )

        response = {"pregunta": request.pregunta, **resultado}

        # Si hay usuario autenticado, agregar info de tracking
        if current_user:
            response["usuario_id"] = str(current_user.id)

        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando consulta: {str(e)}",
        )


@router.post("/validar")
async def validar_parametro(
    request: ValidacionParametroRequest,
    current_user: Optional[UserAuth] = Depends(get_current_user),
):
    """
    Valida un parámetro contra la normativa peruana.

    Parámetros soportados:
    - presion_minima: Presión mínima de servicio (m.c.a.)
    - presion_maxima: Presión máxima estática (m.c.a.)
    - velocidad_minima: Velocidad mínima (m/s)
    - velocidad_maxima: Velocidad máxima (m/s)
    - diametro_minimo: Diámetro mínimo (mm)
    """
    resultado = copiloto.validar_parametro(
        parametro=request.parametro,
        valor=request.valor,
        unidad=request.unidad,
        ambito=request.ambito,
    )

    # Si hay usuario autenticado, agregar info
    if current_user:
        resultado["usuario_id"] = str(current_user.id)

    return resultado


@router.get("/normas")
async def listar_normas():
    """
    Lista todas las normas disponibles en la base de conocimiento.

    Este endpoint es público.
    """
    base = BaseConocimientoNormativa()

    return {
        "normas": [
            {
                "codigo": n["codigo"],
                "nombre": n["nombre"],
                "referencia": n["referencia"],
                "ambito": n["ambito"],
            }
            for n in base.normas
        ],
        "total_normas": len(base.normas),
    }


@router.get("/normas/{codigo}")
async def obtener_norma(codigo: str):
    """
    Obtiene el contenido detallado de una norma específica.

    Este endpoint es público.
    """
    base = BaseConocimientoNormativa()

    norma = next((n for n in base.normas if n["codigo"] == codigo.upper()), None)

    if not norma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Norma '{codigo}' no encontrada",
        )

    return norma


@router.get("/limites/{ambito}")
async def obtener_limites_normativos(ambito: str):
    """
    Obtiene los límites normativos para un ámbito específico.

    Este endpoint es público.
    """
    if ambito not in ["urbano", "rural"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ámbito debe ser 'urbano' o 'rural'",
        )

    limites = {
        "urbano": {
            "presion_minima": {
                "valor": settings.PRESION_MINIMA_URBANA,
                "unidad": "m.c.a.",
                "norma": "RNE OS.050",
            },
            "presion_maxima": {
                "valor": settings.PRESION_ESTATICA_MAXIMA,
                "unidad": "m.c.a.",
                "norma": "RNE OS.050",
            },
            "velocidad_minima": {
                "valor": settings.VELOCIDAD_MINIMA,
                "unidad": "m/s",
                "norma": "RNE OS.050",
            },
            "velocidad_maxima": {
                "valor": settings.VELOCIDAD_MAXIMA,
                "unidad": "m/s",
                "norma": "RNE OS.050",
            },
            "diametro_minimo": {
                "valor": settings.DIAMETRO_MINIMO_URBANO,
                "unidad": "mm",
                "norma": "RNE OS.050",
            },
            "dotacion_clima_calido": {
                "valor": settings.DOTACION_CLIMA_CALIDO,
                "unidad": "lppd",
                "norma": "RM 107-2025",
            },
            "dotacion_clima_templado": {
                "valor": settings.DOTACION_CLIMA_TEMPLADO,
                "unidad": "lppd",
                "norma": "RM 107-2025",
            },
            "dotacion_clima_frio": {
                "valor": settings.DOTACION_CLIMA_FRIO,
                "unidad": "lppd",
                "norma": "RM 107-2025",
            },
        },
        "rural": {
            "presion_minima": {
                "valor": settings.PRESION_MINIMA_RURAL,
                "unidad": "m.c.a.",
                "norma": "RM 192-2018",
            },
            "presion_minima_piletas": {
                "valor": settings.PRESION_MINIMA_PILETAS,
                "unidad": "m.c.a.",
                "norma": "RM 192-2018",
            },
            "velocidad_minima": {
                "valor": settings.VELOCIDAD_MINIMA,
                "unidad": "m/s",
                "norma": "RNE OS.050",
            },
            "velocidad_maxima": {
                "valor": settings.VELOCIDAD_MAXIMA,
                "unidad": "m/s",
                "norma": "RNE OS.050",
            },
            "diametro_minimo": {
                "valor": settings.DIAMETRO_MINIMO_RURAL,
                "unidad": "mm",
                "norma": "RM 192-2018",
            },
        },
    }

    return {"ambito": ambito, "limites": limites[ambito]}


@router.get("/diametros-comerciales")
async def obtener_diametros_comerciales():
    """
    Lista los diámetros comerciales disponibles.

    Este endpoint es público.
    """
    return {
        "diametros": settings.DIAMETROS_COMERCIALES,
        "unidad": "mm",
        "recomendacion": "Usar diámetros interiores reales según clase de tubería",
    }


@router.get("/coef-hazen-williams")
async def obtener_coeficientes_hw():
    """
    Lista los coeficientes de Hazen-Williams por material.

    Este endpoint es público.
    """
    return {
        "coeficientes": {
            "pvc": {"valor": 150, "descripcion": "Tuberías de PVC"},
            "hdpe": {"valor": 140, "descripcion": "Tuberías de HDPE"},
            "hdde": {"valor": 140, "descripcion": "Tuberías de HDDE"},
            "concreto": {"valor": 130, "descripcion": "Tuberías de concreto"},
            "acero": {"valor": 140, "descripcion": "Tuberías de acero"},
            "cobre": {"valor": 130, "descripcion": "Tuberías de cobre"},
        },
        "formula": "h_f = 10.674 * (Q^1.852 / C^1.852 / D^4.8704) * L",
        "referencia": "RNE OS.050",
    }
