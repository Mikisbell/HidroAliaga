"""
Motor de Cálculo Hidráulico - H-Redes Perú
Implementación del Método de Hardy Cross y algoritmos híbridos
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from uuid import UUID
import numpy as np
from math import sqrt, pow


@dataclass
class Nudo:
    """Representación de un nudo en la red"""
    id: UUID
    codigo: str
    tipo: str
    elevacion: float  # m.s.n.m.
    demanda: float = 0.0  # l/s
    presion_calc: float = 0.0  # m.c.a.
    cota_agua: float = 0.0  # m


@dataclass
class Tramo:
    """Representación de un tramo en la red"""
    id: UUID
    codigo: str
    nudo_origen_id: UUID
    nudo_destino_id: UUID
    longitud: float  # m
    diametro: float  # mm
    material: str = "pvc"
    coef_hazen_williams: float = 150.0
    caudal: float = 0.0  # l/s
    velocidad: float = 0.0  # m/s
    perdida_carga: float = 0.0  # m
    n_origen: float = 1.852  # Exponente Hazen-Williams


@dataclass
class Malla:
    """Representación de una malla"""
    id: str
    tramos: List[str]  # Códigos de tramos
    nudos_circunferenciales: List[str]  # Códigos de nudos


@dataclass
class ResultadoIteracion:
    """Resultado de una iteración"""
    iteracion: int
    delta_q: float
    error_maximo: float
    convergencia_alcanzada: bool
    correcciones_por_malla: Dict[str, float] = field(default_factory=dict)


class MotorHidraulico:
    """
    Motor de Cálculo Hidráulico Híbrido
    
    Soporta:
    - Redes Cerradas (Mallas): Método de Hardy Cross
    - Redes Abiertas: Balance de masa y energía
    - Redes Mixtas: Algoritmo híbrido
    """
    
    def __init__(
        self,
        nudos: Dict[UUID, Nudo],
        tramos: Dict[UUID, Tramo],
        tolerancia: float = 1e-7,
        max_iteraciones: int = 1000,
        coef_hazen_williams: float = 10.674,
        exponente_hw: float = 1.852
    ):
        self.nudos = nudos
        self.tramos = tramos
        self.tolerancia = tolerancia
        self.max_iteraciones = max_iteraciones
        self.coef_hazen_williams = coef_hazen_williams
        self.exponente_hw = exponente_hw
        
        # Detectar tipo de red
        self.tipo_red = self._detectar_tipo_red()
        
        # Identificar mallas
        self.mallas = self._identificar_mallas()
        
        # Historial de iteraciones
        self.historial_iteraciones: List[ResultadoIteracion] = []
        
    def _detectar_tipo_red(self) -> str:
        """Detecta el tipo de red basado en la topología"""
        # Usar teoría de grafos para detectar ciclos
        nudos_ids = set(self.nudos.keys())
        tramos_conectados = set()
        
        for tramo in self.tramos.values():
            tramos_conectados.add(tramo.nudo_origen_id)
            tramos_conectados.add(tramo.nudo_destino_id)
        
        # Si todos los nudos están conectados pero hay ciclos -> cerrada
        # Si hay nudos de demanda terminal -> abierta
        # Si ambas -> mixta
        
        # Simplificación: asumir red mixta por defecto
        return "mixta"
    
    def _identificar_mallas(self) -> List[Malla]:
        """
        Identifica las mallas en la red usando teoría de grafos
        Elimina necesidad de entrada manual de "otros circuitos"
        """
        # Construir grafo
        from collections import defaultdict, deque
        
        grafo = defaultdict(list)
        for tramo in self.tramos.values():
            grafo[tramo.nudo_origen_id].append(tramo.nudo_destino_id)
            grafo[tramo.nudo_destino_id].append(tramo.nudo_origen_id)
        
        # Encontrar ciclos usando DFS
        visitados = set()
        mallas = []
        malla_id = 0
        
        def dfs(vertice, padre, camino):
            nonlocal malla_id
            visitados.add(vertice)
            camino.append(vertice)
            
            for vecino in grafo[vertice]:
                if vecino == padre:
                    continue
                if vecino in camino:
                    # Encontró un ciclo
                    idx_inicio = camino.index(vecino)
                    ciclo = camino[idx_inicio:]
                    
                    if len(ciclo) >= 3:  # Malla válida
                        codigos_tramos = []
                        for i in range(len(ciclo)):
                            origen = ciclo[i]
                            destino = ciclo[(i + 1) % len(ciclo)]
                            
                            # Buscar tramo
                            for t in self.tramos.values():
                                if (t.nudo_origen_id == origen and t.nudo_destino_id == destino) or \
                                   (t.nudo_destino_id == origen and t.nudo_origen_id == destino):
                                    codigos_tramos.append(t.codigo)
                                    break
                        
                        mallas.append(Malla(
                            id=f"M-{malla_id}",
                            tramos=codigos_tramos,
                            nudos_circunferenciales=ciclo
                        ))
                        malla_id += 1
                elif vecino not in visitados:
                    dfs(vecino, vertice, camino)
            
            camino.pop()
        
        for nudo in self.nudos.keys():
            if nudo not in visitados:
                dfs(nudo, None, [])
        
        return mallas
    
    def calcular_perdida_hazen_williams(
        self,
        caudal_lps: float,
        diametro_mm: float,
        longitud_m: float,
        coef_hw: float = 150.0
    ) -> float:
        """
        Calcula la pérdida de carga usando Hazen-Williams
        
        Fórmula: h_f = 10.674 * (Q^1.852 / C^1.852 / D^4.8704) * L
        
        Donde:
        - Q = caudal en l/s
        - D = diámetro interior en mm
        - L = longitud en m
        - C = coeficiente de Hazen-Williams
        """
        if caudal_lps <= 0:
            return 0.0
        
        Q = caudal_lps
        D = diametro_mm
        L = longitud_m
        C = coef_hw
        
        # Fórmula original
        # h_f = 10.674 * (Q ** 1.852 / (C ** 1.852 * D ** 4.8704)) * L
        
        # Fórmula simplificada optimizada
        h_f = 10.674 * pow(Q, 1.852) * L / (pow(C, 1.852) * pow(D, 4.8704))
        
        return h_f
    
    def calcular_velocidad(
        self,
        caudal_lps: float,
        diametro_mm: float
    ) -> float:
        """
        Calcula la velocidad del flujo
        
        v = Q / A = Q / (π * D² / 4)
        Donde Q está en l/s y D en mm, resultado en m/s
        """
        if diametro_mm <= 0:
            return 0.0
        
        # Convertir caudal a m³/s
        Q_m3s = caudal_lps / 1000.0
        
        # Área en m²
        D_m = diametro_mm / 1000.0
        area = 3.14159 * D_m * D_m / 4.0
        
        if area <= 0:
            return 0.0
        
        return Q_m3s / area
    
    def metodo_hardy_cross(self) -> Tuple[bool, float]:
        """
        Implementa el Método de Hardy Cross para redes cerradas
        
        Retorna:
        - convergencia: bool
        - error_final: float
        """
        print("=" * 60)
        print("MÉTODO DE HARDY CROSS")
        print("=" * 60)
        print(f"Tolerancia: {self.tolerancia}")
        print(f"Mallas identificadas: {len(self.mallas)}")
        for malla in self.mallas:
            print(f"  - {malla.id}: {len(malla.tramos)} tramos")
        print()
        
        # Inicializar caudales (distribución inicial)
        self._distribuir_caudales_iniciales()
        
        # Iteraciones
        for iteracion in range(self.max_iteraciones):
            print(f"Iteración {iteracion + 1}...")
            
            correcciones_mallas = {}
            error_maximo = 0.0
            
            # Para cada malla, calcular corrección
            for malla in self.mallas:
                Q_correccion = self._calcular_correccion_malla(malla)
                correcciones_mallas[malla.id] = Q_correccion
                
                error_maximo = max(error_maximo, abs(Q_correccion))
            
            # Aplicar correcciones
            self._aplicar_correcciones(correcciones_mallas)
            
            # Guardar iteración
            resultado = ResultadoIteracion(
                iteracion=iteracion + 1,
                delta_q=sum(abs(c) for c in correcciones_mallas.values()),
                error_maximo=error_maximo,
                convergencia_alcanzada=error_maximo < self.tolerancia,
                correcciones_por_malla=correcciones_mallas
            )
            self.historial_iteraciones.append(resultado)
            
            print(f"  Error máximo: {error_maximo:.10f}")
            
            if error_maximo < self.tolerancia:
                print(f"\n✓ CONVERGENCIA ALCANZADA en {iteracion + 1} iteraciones")
                return True, error_maximo
        
        print(f"\n✗ NO SE ALCANZÓ CONVERGENCIA después de {self.max_iteraciones} iteraciones")
        return False, error_maximo
    
    def _distribuir_caudales_iniciales(self):
        """Distribuye caudales iniciales por balance de masa"""
        # Por ahora, distribución uniforme basada en demanda total
        # TODO: Implementar distribución más sofisticada
        
        total_demanda = sum(n.demanda for n in self.nudos.values())
        
        for tramo in self.tramos.values():
            # Asumir caudal inicial proporcional a demanda
            tramo.caudal = total_demanda / len(self.tramos)
    
    def _calcular_correccion_malla(self, malla: Malla) -> float:
        """
        Calcula la corrección de caudal para una malla
        
        ΔQ = - Σ(h_f) / Σ(n * Q^(n-1) * K)
        
        Donde:
        - h_f = pérdida de carga en el tramo
        - Q = caudal en el tramo
        - n = 1.852 para Hazen-Williams
        - K = constante del tramo (L / (C^1.852 * D^4.8704))
        """
        suma_hf = 0.0
        suma_nQ_n1K = 0.0
        
        for codigo_tramo in malla.tramos:
            tramo = next((t for t in self.tramos.values() if t.codigo == codigo_tramo), None)
            if tramo is None:
                continue
            
            Q = abs(tramo.caudal)
            D = tramo.diametro
            L = tramo.longitud
            C = tramo.coef_hazen_williams
            
            # Pérdida de carga (considerar signo)
            hf = self.calcular_perdida_hazen_williams(Q, D, L, C)
            
            # Determinar dirección del flujo para el signo
            # (simplificado: asumir flujo en dirección de la malla)
            suma_hf += hf
            
            # Denominador: n * Q^(n-1) * K
            K = L / (pow(C, 1.852) * pow(D, 4.8704))
            n = self.exponente_hw
            suma_nQ_n1K += n * pow(Q, n - 1) * K
        
        if suma_nQ_n1K == 0:
            return 0.0
        
        # Corrección
        delta_q = -suma_hf / suma_nQ_n1K
        
        return delta_q
    
    def _aplicar_correcciones(self, correcciones: Dict[str, float]):
        """Aplica las correcciones de caudal a los tramos"""
        for malla in self.mallas:
            delta_q = correcciones.get(malla.id, 0.0)
            
            for codigo_tramo in malla.tramos:
                tramo = next((t for t in self.tramos.values() if t.codigo == codigo_tramo), None)
                if tramo is None:
                    continue
                
                # Actualizar caudal (signo según dirección de la malla)
                tramo.caudal += delta_q
                
                # Recalcular pérdida de carga y velocidad
                if tramo.caudal != 0:
                    tramo.perdida_carga = self.calcular_perdida_hazen_williams(
                        tramo.caudal, tramo.diametro, tramo.longitud, tramo.coef_hazen_williams
                    )
                    tramo.velocidad = self.calcular_velocidad(
                        abs(tramo.caudal), tramo.diametro
                    )
                else:
                    tramo.velocidad = 0.0
    
    def calcular_red_abierta(self) -> Dict:
        """
        Calcula una red abierta (ramales) por balance determinístico
        
        Returns:
        - Dict con resultados de presiones y caudales
        """
        print("=" * 60)
        print("CÁLCULO DE RED ABIERTA")
        print("=" * 60)
        
        # Ordenar nudos por distancia desde la fuente (BFS)
        nudos_ordenados = self._ordenar_nudos_bfs()
        
        # Calcular desde la fuente hacia los terminales
        resultados = {}
        
        for nudo_id in nudos_ordenados:
            nudo = self.nudos[nudo_id]
            
            # Encontrar tramos conectados
            tramos_entrada = [t for t in self.tramos.values() if t.nudo_destino_id == nudo_id]
            tramos_salida = [t for t in self.tramos.values() if t.nudo_origen_id == nudo_id]
            
            if not tramos_entrada:
                # Nudo fuente - usar elevación已知
                nudo.cota_agua = nudo.elevacion
            else:
                # Calcular basándose en el tramo de entrada
                tramo_ent = tramos_entrada[0]
                
                # Pérdida de carga
                hf = self.calcular_perdida_hazen_williams(
                    tramo_ent.caudal, tramo_ent.diametro, 
                    tramo_ent.longitud, tramo_ent.coef_hazen_williams
                )
                
                # Cota de agua = cota del nudo anterior - pérdida
                nudo_anterior = self.nudos[tramo_ent.nudo_origen_id]
                nudo.cota_agua = nudo_anterior.cota_agua - hf
            
            # Presión = cota de agua - elevación
            nudo.presion_calc = nudo.cota_agua - nudo.elevacion
            
            # Calcular caudales de salida
            for tramo in tramos_salida:
                if nudo.tipo == "consumo":
                    tramo.caudal = nudo.demanda
                else:
                    tramo.caudal = sum(
                        t.caudal for t in tramos_salida if t != tramo
                    ) + sum(
                        n.demanda for n in self.nudos.values() 
                        if n.id in [tt.nudo_destino_id for tt in self.tramos.values() if tt.nudo_origen_id == nudo_id]
                    )
            
            resultados[nudo_id] = {
                "cota_agua": nudo.cota_agua,
                "presion": nudo.presion_calc
            }
        
        return resultados
    
    def _ordenar_nudos_bfs(self) -> List[UUID]:
        """Ordena nudos usando BFS desde la fuente"""
        from collections import deque
        
        # Encontrar nudos fuente
        fuentes = [n for n in self.nudos.values() 
                  if n.tipo in ["cisterna", "reservorio", "tanque_elevado"]]
        
        if not fuentes:
            return list(self.nudos.keys())
        
        visitados = set()
        cola = deque([f.id for f in fuentes])
        orden = []
        
        while cola:
            nudo_id = cola.popleft()
            if nudo_id not in visitados:
                visitados.add(nudo_id)
                orden.append(nudo_id)
                
                # Agregar nudos conectados
                for tramo in self.tramos.values():
                    if tramo.nudo_origen_id == nudo_id and tramo.nudo_destino_id not in visitados:
                        cola.append(tramo.nudo_destino_id)
        
        return orden
    
    def calcular_hibrido(self) -> Tuple[bool, float]:
        """
        Algoritmo híbrido: resuelve primero las mallas y luego propaga
        hacia los ramales abiertos
        """
        print("=" * 60)
        print("CÁLCULO HÍBRIDO (Mallas + Ramales)")
        print("=" * 60)
        
        # Paso 1: Resolver mallas (Hardy Cross)
        print("\n[PASO 1] Resolviendo mallas...")
        convergencia, error = self.metodo_hardy_cross()
        
        if not convergencia:
            print("Advertencia: Las mallas no convergieron completamente")
        
        # Paso 2: Propagar hacia ramales abiertos
        print("\n[PASO 2] Propagando hacia ramales...")
        self._propagar_presiones_mallas()
        
        # Recalcular parámetros finales
        self._recalcular_parametros()
        
        return convergencia, error
    
    def _propagar_presiones_mallas(self):
        """Propaga las presiones desde las mallas hacia los ramales"""
        # Identificar ramales conectados a mallas
        nudos_malla = set()
        for malla in self.mallas:
            nudos_malla.update(malla.nudos_circunferenciales)
        
        # Propagar hacia nudos no-malla
        for nudo in self.nudos.values():
            if nudo.id not in nudos_malla:
                # Buscar tramo conectado a malla
                for tramo in self.tramos.values():
                    if tramo.nudo_destino_id == nudo.id:
                        nudo_origen = self.nudos[tramo.nudo_origen_id]
                        hf = self.calcular_perdida_hazen_williams(
                            tramo.caudal, tramo.diametro, 
                            tramo.longitud, tramo.coef_hazen_williams
                        )
                        nudo.cota_agua = nudo_origen.cota_agua - hf
                        nudo.presion_calc = nudo.cota_agua - nudo.elevacion
                        break
    
    def _recalcular_parametros(self):
        """Recalcula velocidades y presiones finales"""
        for tramo in self.tramos.values():
            if tramo.diametro > 0:
                tramo.velocidad = self.calcular_velocidad(abs(tramo.caudal), tramo.diametro)
                tramo.perdida_carga = self.calcular_perdida_hazen_williams(
                    abs(tramo.caudal), tramo.diametro, 
                    tramo.longitud, tramo.coef_hazen_williams
                )
        
        for nudo in self.nudos.values():
            nudo.presion_calc = nudo.cota_agua - nudo.elevacion
    
    def generar_tabla_iteraciones(self) -> List[Dict]:
        """
        Genera la tabla de iteraciones para transparencia académica
        """
        tabla = []
        
        for resultado in self.historial_iteraciones:
            fila = {
                "iteracion": resultado.iteracion,
                "delta_q_total": resultado.delta_q,
                "error_maximo": resultado.error_maximo,
                "convergencia": resultado.convergencia_alcanzada
            }
            
            # Agregar correcciones por malla
            for malla_id, delta_q in resultado.correcciones_por_malla.items():
                fila[f"malla_{malla_id}_dq"] = delta_q
            
            tabla.append(fila)
        
        return tabla
    
    def obtener_resumen_resultados(self) -> Dict:
        """Obtiene un resumen de los resultados"""
        presiones = [n.presion_calc for n in self.nudos.values() if n.presion_calc > 0]
        velocidades = [t.velocidad for t in self.tramos.values() if t.velocidad > 0]
        
        return {
            "tipo_red": self.tipo_red,
            "numero_mallas": len(self.mallas),
            "numero_nudos": len(self.nudos),
            "numero_tramos": len(self.tramos),
            "iteraciones_realizadas": len(self.historial_iteraciones),
            "presion_minima": min(presiones) if presiones else 0,
            "presion_maxima": max(presiones) if presiones else 0,
            "velocidad_minima": min(velocidades) if velocidades else 0,
            "velocidad_maxima": max(velocidades) if velocidades else 0,
            "convergencia_final": self.historial_iteraciones[-1].convergencia_alcanzada if self.historial_iteraciones else False,
            "error_final": self.historial_iteraciones[-1].error_maximo if self.historial_iteraciones else None
        }
