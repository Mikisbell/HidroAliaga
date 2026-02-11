"""
Copiloto Normativo - H-Redes Perú
Integración con LLM para consultas sobre normativa peruana
"""

from typing import List, Dict, Optional
from pydantic import BaseModel
import httpx


class NormaInfo(BaseModel):
    """Información sobre una norma"""
    codigo: str
    nombre: str
    referencia: str
    articulo: Optional[str] = None
    contenido: str
    ambito: List[str] = []


class BaseConocimientoNormativo(BaseModel):
    """Base de conocimiento normativo para RAG"""
    
    normas: List[Dict] = [
        {
            "codigo": "RNE-OS.050",
            "nombre": "Norma OS.050 - Redes de Distribución de Agua Potable",
            "referencia": "Reglamento Nacional de Edificaciones",
            "contenido": """
            La presente Norma establece los requisitos para el diseño de redes de distribución 
            de agua potable para consumo humano.
            
            PRESIONES MÍNIMAS:
            - La presión mínima en cualquier punto de la red será de 10 m.c.a. para redes urbanas.
            - Para redes rurales según RM 192-2018, la presión mínima es de 5 m.c.a.
            - En piletas públicas, la presión mínima será de 3.5 m.c.a.
            
            PRESIONES MÁXIMAS:
            - La presión estática máxima en la red no excederá de 50 m.c.a.
            - En caso de exceder, se instalarán válvulas reductoras de presión (VRP).
            
            VELOCIDADES:
            - La velocidad mínima será de 0.60 m/s para evitar sedimentación.
            - La velocidad máxima será de 3.00 m/s para evitar golpe de ariete.
            
            DIÁMETROS MÍNIMOS:
            - Redes urbanas: Diámetro mínimo 75 mm (3 pulgadas).
            - Redes rurales: Diámetro mínimo 25 mm (1 pulgada).
            - Para conexiones domiciliarias: Diámetro mínimo 15 mm (1/2 pulgada).
            
            COEFICIENTE DE HAZEN-WILLIAMS:
            - Tuberías de PVC: C = 150
            - Tuberías de HDPE: C = 140
            - Tuberías de concreto: C = 130
            - Tuberías de acero: C = 140
            """,
            "ambito": ["urbano", "rural", "industrial"]
        },
        {
            "codigo": "RM-192-2018-VIVIENDA",
            "nombre": "Resolución Ministerial 192-2018-VIVIENDA",
            "referencia": "Ministerio de Vivienda, Construcción y Saneamiento",
            "contenido": """
            Aprueba el Reglamento de Prestaciones del Servicio de Saneamiento.
            
            PARÁMETROS PARA ÁMBITO RURAL:
            - Presión mínima de servicio: 5.00 m.c.a.
            - En piletas públicas: 3.50 m.c.a.
            - Velocidad máxima: 3.00 m/s
            - Velocidad mínima: 0.60 m/s
            
            DOTACIONES MÍNIMAS PARA ÁMBITO RURAL:
            - Urbano Rural: 50 l/hab/día
            - Periurbano: 60 l/hab/día
            - Rural disperso: 40 l/hab/día
            
            UNIDADES BÁSICAS DE SANEAMIENTO (UBS):
            - Tipo节水: 300 l/persona/día
            - Tipo Arrastre Hidráulico: 80 l/persona/día
            - Tipo Compostera: 20 l/persona/día
            """,
            "ambito": ["rural"]
        },
        {
            "codigo": "RM-107-2025-VIVIENDA",
            "nombre": "Resolución Ministerial 107-2025-VIVIENDA",
            "referencia": "Ministerio de Vivienda, Construcción y Saneamiento",
            "contenido": """
            Actualiza dotaciones según zona climática.
            
            DOTACIONES PER CÁPITA POR CLIMA:
            - Clima cálido: 169 lppd (litros por persona por día)
            - Clima templado: 155 lppd
            - Clima frío: 129 lppd
            
            CLASIFICACIÓN POR CLIMA:
            - Costa norte (Tumbes, Piura, Lambayeque, La Libertad): Clima cálido
            - Costa central y sur, Lima: Clima templado
            - Sierra y selva: Variable según altitud
            
            FACTORES DE CORRECCIÓN:
            - Temperatura media anual > 20°C: Factor 1.00
            - Temperatura entre 15-20°C: Factor 0.95
            - Temperatura < 15°C: Factor 0.90
            """,
            "ambito": ["urbano", "rural"]
        },
        {
            "codigo": "NTP-ISO.4422",
            "nombre": "NTP-ISO 4422 - Tuberías de PVC para conducción de agua",
            "referencia": "Instituto Nacional de Calidad",
            "contenido": """
            Especificaciones técnicas para tuberías de PVC-U.
            
            CLASES DE PRESIÓN:
            - CL-5: Presión de trabajo 5 kg/cm² (50 m.c.a.)
            - CL-7.5: Presión de trabajo 7.5 kg/cm² (75 m.c.a.)
            - CL-10: Presión de trabajo 10 kg/cm² (100 m.c.a.)
            - CL-15: Presión de trabajo 15 kg/cm² (150 m.c.a.)
            
            DIÁMETROS COMERCIALES (mm):
            20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160, 200, 250, 315, 400
            
            ESPESORES MÍNIMOS (CL-10):
            - DN 63: 3.0 mm
            - DN 75: 3.6 mm
            - DN 90: 4.3 mm
            - DN 110: 5.3 mm
            - DN 160: 7.7 mm
            """,
            "ambito": ["urbano", "rural"]
        }
    ]
    
    def buscar_normativa(self, consulta: str) -> List[Dict]:
        """Busca normativa relevante basada en consulta"""
        consulta_lower = consulta.lower()
        resultados = []
        
        for norma in self.normas:
            # Buscar coincidencias en contenido
            score = 0
            
            # Palabras clave para scoring
            if any(p in consulta_lower for p in ["presión", "presion", "m.c.a"]):
                if "presión" in norma["contenido"].lower():
                    score += 3
            if any(p in consulta_lower for p in ["velocidad", "velocidad"]):
                if "velocidad" in norma["contenido"].lower():
                    score += 3
            if any(p in consulta_lower for p in ["dotación", "dotacion", "lppd"]):
                if "dotación" in norma["contenido"].lower() or "lppd" in norma["contenido"].lower():
                    score += 3
            if any(p in consulta_lower for p in ["diámetro", "diametro"]):
                if "diámetro" in norma["contenido"].lower():
                    score += 2
            if any(p in consulta_lower for p in ["urbano"]):
                if "urbano" in norma["ambito"]:
                    score += 1
            if any(p in consulta_lower for p in ["rural"]):
                if "rural" in norma["ambito"]:
                    score += 1
            
            if score > 0:
                resultados.append({
                    **norma,
                    "score": score
                })
        
        # Ordenar por score
        resultados.sort(key=lambda x: x["score"], reverse=True)
        return resultados[:5]
    
    def obtener_respuesta(self, consulta: str, contexto: Optional[str] = None) -> Dict:
        """Genera respuesta a consulta normativa"""
        # Buscar normativa relevante
        normas_encontradas = self.buscar_normativa(consulta)
        
        # Construir contexto
        contexto_completo = ""
        referencias = []
        
        for norma in normas_encontradas:
            contexto_completo += f"\n\n## {norma['codigo']}: {norma['nombre']}\n"
            contexto_completo += norma["contenido"]
            referencias.append({
                "codigo": norma["codigo"],
                "nombre": norma["nombre"],
                "referencia": norma["referencia"]
            })
        
        if contexto:
            contexto_completo += f"\n\n## Contexto del Proyecto\n{contexto}"
        
        # Generar respuesta basada en las normas
        respuesta = self._generar_respuesta_estructurada(consulta, normas_encontradas)
        
        return {
            "respuesta": respuesta,
            "referencias": referencias,
            "normas_aplicables": [n["codigo"] for n in normas_encontradas],
            "confidence_score": self._calcular_confianza(normas_encontradas)
        }
    
    def _generar_respuesta_estructurada(self, consulta: str, normas: List[Dict]) -> str:
        """Genera respuesta estructurada basada en consulta"""
        consulta_lower = consulta.lower()
        respuesta = []
        
        respuesta.append("## Respuesta Normativa\n")
        
        # Determinar tipo de consulta
        if "presión" in consulta_lower or "presion" in consulta_lower:
            respuesta.append("### Presiones de Servicio\n")
            
            for norma in normas:
                if "presión" in norma["contenido"].lower():
                    # Extraer información sobre presiones
                    lines = norma["contenido"].split('\n')
                    for line in lines:
                        if "presión" in line.lower() or "m.c.a" in line:
                            respuesta.append(f"- {line.strip()}\n")
            
            respuesta.append("\n**Recomendación:** Verificar las presiones en todos los nudos de la red ")
            respuesta.append("utilizando el módulo de validación del sistema.\n")
        
        elif "velocidad" in consulta_lower:
            respuesta.append("### Velocidades en Tuberías\n")
            
            for norma in normas:
                if "velocidad" in norma["contenido"].lower():
                    lines = norma["contenido"].split('\n')
                    for line in lines:
                        if "velocidad" in line.lower():
                            respuesta.append(f"- {line.strip()}\n")
            
            respuesta.append("\n**Nota:** Velocidades por debajo de 0.60 m/s pueden causar ")
            respuesta.append("sedimentación. Velocidades mayores a 3.00 m/s aumentan el riesgo ")
            respuesta.append("de golpe de ariete.\n")
        
        elif "diámetro" in consulta_lower or "diametro" in consulta_lower:
            respuesta.append("### Diámetros Mínimos\n")
            
            for norma in normas:
                if "diámetro" in norma["contenido"].lower():
                    lines = norma["contenido"].split('\n')
                    for line in lines:
                        if "diámetro" in line.lower() or "mínimo" in line.lower():
                            respuesta.append(f"- {line.strip()}\n")
            
            respuesta.append("\n**Recomendación:** Para uso residencial, el diámetro mínimo ")
            respuesta.append("de la conexión domiciliaria es 15 mm (1/2 pulgada).\n")
        
        elif "dotación" in consulta_lower or "dotacion" in consulta_lower or "lppd" in consulta_lower:
            respuesta.append("### Dotaciones de Agua\n")
            
            for norma in normas:
                if "dotación" in norma["contenido"].lower() or "lppd" in norma["contenido"].lower():
                    lines = norma["contenido"].split('\n')
                    for line in lines:
                        if "litros" in line.lower() or "lppd" in line.lower() or "clima" in line.lower():
                            respuesta.append(f"- {line.strip()}\n")
        
        else:
            # Respuesta general
            respuesta.append("Basándome en la normativa peruana vigente:\n\n")
            
            for norma in normas[:3]:
                respuesta.append(f"**{norma['codigo']}** - {norma['nombre']}\n")
                resumen = norma["contenido"][:200] + "..." if len(norma["contenido"]) > 200 else norma["contenido"]
                respuesta.append(f"{resumen}\n\n")
        
        # Agregar referencias
        respuesta.append("---\n")
        respuesta.append("**Referencias Normativas:**\n")
        for ref in referencias:
            respuesta.append(f"- [{ref['codigo']}] {ref['nombre']}\n")
        
        return "".join(respuesta)
    
    def _calcular_confianza(self, normas: List[Dict]) -> float:
        """Calcula score de confianza basado en relevancia"""
        if not normas:
            return 0.0
        
        max_score = max(n.get("score", 1) for n in normas)
        avg_score = sum(n.get("score", 1) for n in normas) / len(normas)
        
        # Normalizar entre 0 y 1
        confianza = min(avg_score / 5, 1.0)
        
        return round(confianza, 2)


class CopilotoNormativo:
    """Copiloto Normativo con integración LLM"""
    
    def __init__(self, api_key: str = "", modelo: str = "kimi-k2.5", proveedor: str = "moonshot"):
        self.base_conocimiento = BaseConocimientoNormativo()
        self.api_key = api_key
        self.modelo = modelo
        self.proveedor = proveedor
        self.habilitado = bool(api_key)
    
    async def responder(
        self,
        pregunta: str,
        contexto: Optional[str] = None,
        usar_rag: bool = True
    ) -> Dict:
        """
        Responde a pregunta normativa
        
        Args:
        - pregunta: Pregunta del usuario
        - contexto: Contexto adicional del proyecto
        - usar_rag: Usar RAG para mejorar respuesta
        
        Returns:
        - Dict con respuesta, referencias y score de confianza
        """
        # Si no hay API key o no se usa RAG, usar base de conocimiento local
        if not self.habilitado or not usar_rag:
            resultado = self.base_conocimiento.obtener_respuesta(pregunta, contexto)
            return resultado
        
        # Si hay API key, usar LLM con RAG
        try:
            respuesta_rag = await self._consultar_llm(pregunta, contexto)
            return respuesta_rag
        except Exception as e:
            # Fallback a base de conocimiento local
            print(f"Error consultando LLM: {e}. Usando fallback local.")
            resultado = self.base_conocimiento.obtener_respuesta(pregunta, contexto)
            resultado["nota"] = "Respuesta generada con base de conocimiento local"
            return resultado
    
    async def _consultar_llm(self, pregunta: str, contexto: Optional[str] = None) -> Dict:
        """Consulta LLM (Kimi K2.5 de Moonshot o OpenAI)"""
        # Obtener contexto de normas relevantes
        normas_relevantes = self.base_conocimiento.buscar_normativa(pregunta)
        
        contexto_normativo = "\n".join([
            f"--- {n['codigo']} ---\n{n['contenido']}"
            for n in normas_relevantes
        ])
        
        prompt = f"""
Eres un asistente técnico especializado en normativa peruana de agua potable y saneamiento.

CONTEXTO NORMATIVO:
{contexto_normativo}

{'CONTEXTO DEL PROYECTO:' if contexto else ''}
{contexto if contexto else ''}

PREGUNTA DEL USUARIO:
{pregunta}

INSTRUCCIONES:
1. Responde de manera precisa y técnica
2. Cita las normas específicas que sustentan tu respuesta
3. Si hay rangos o valores típicos, menciónalos
4. Sugiere verificaciones adicionales cuando sea necesario
5. Mantén un tono profesional y didáctico

RESPUESTA:
"""
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            if self.proveedor == "moonshot":
                # Kimi K2 de Moonshot AI
                response = await client.post(
                    "https://api.moonshot.cn/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.modelo,  # "kimi-k2-turbo-preview"
                        "messages": [
                            {"role": "system", "content": "Eres un ingeniero sanitario experto en normativa peruana de agua potable y saneamiento. Responde en español de manera precisa y técnica."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 2000
                    }
                )
            else:
                # OpenAI (GPT-4)
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.modelo,
                        "messages": [
                            {"role": "system", "content": "Eres un ingeniero sanitario experto en normativa peruana."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1500
                    }
                )
            
            data = response.json()
            respuesta_texto = data["choices"][0]["message"]["content"]
            
            return {
                "respuesta": respuesta_texto,
                "referencias": [
                    {"codigo": n["codigo"], "nombre": n["nombre"]}
                    for n in normas_relevantes
                ],
                "normas_aplicables": [n["codigo"] for n in normas_relevantes],
                "confidence_score": 0.85
            }
    
    def validar_parametro(
        self,
        parametro: str,
        valor: float,
        unidad: str,
        ambito: str = "urbano"
    ) -> Dict:
        """
        Valida un parámetro contra la normativa
        
        Args:
        - parametro: Tipo de parámetro (presion, velocidad, diametro, dotacion)
        - valor: Valor a validar
        - unidad: Unidad del valor
        - ambito: Urbano o rural
        
        Returns:
        - Dict con resultado de validación
        """
        limites = {
            "presion_minima": {
                "urbano": (10.0, "m.c.a.", "RNE OS.050"),
                "rural": (5.0, "m.c.a.", "RM 192-2018")
            },
            "presion_maxima": {
                "urbano": (50.0, "m.c.a.", "RNE OS.050"),
                "rural": (50.0, "m.c.a.", "RM 192-2018")
            },
            "velocidad_minima": {
                "ambos": (0.60, "m/s", "RNE OS.050")
            },
            "velocidad_maxima": {
                "ambos": (3.00, "m/s", "RNE OS.050")
            },
            "diametro_minimo": {
                "urbano": (75.0, "mm", "RNE OS.050"),
                "rural": (25.0, "mm", "RM 192-2018")
            }
        }
        
        if parametro not in limites:
            return {
                "validado": False,
                "mensaje": f"Parámetro '{parametro}' no reconocido para validación"
            }
        
        clave_ambito = ambito if ambito in limites[parametro] else "ambos"
        limites_param = limites[parametro].get(clave_ambito) or limites[parametro]["ambos"]
        
        limite_min, unidad_ref, norma = limites_param
        
        # Determinar si es mínimo o máximo
        if "minima" in parametro or "minimo" in parametro:
            cumplimiento = valor >= limite_min
            mensaje = f"{'Cumple' if cumplimiento else 'No cumple'} con el mínimo de {limite_min} {unidad_ref} ({norma})"
        else:
            cumplimiento = valor <= limite_min
            mensaje = f"{'Cumple' if cumplimiento else 'No cumple'} con el máximo de {limite_min} {unidad_ref} ({norma})"
        
        return {
            "parametro": parametro,
            "valor": valor,
            "limite": limite_min,
            "unidad": unidad_ref,
            "norma": norma,
            "validado": cumplimiento,
            "mensaje": mensaje,
            "ambito": ambito
        }
