"""
Optimizador de Diámetros - H-Redes Perú
Implementación de Algoritmo Genético para optimización de costos
"""

from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from uuid import UUID
import random
import time
import numpy as np


@dataclass
class Individuo:
    """Representación de un individuo en el AG"""
    cromosoma: List[float]  # Diámetros propuestos para cada tramo
    aptitud: float = 0.0
    factible: bool = False


class OptimizadorGA:
    """
    Optimizador de Diámetros usando Algoritmo Genético
    
    Objetivo: Minimizar el costo total de la red asegurando que todos
    los nudos cumplan con la presión mínima normativa.
    """
    
    def __init__(
        self,
        nudos: Dict[UUID, Dict],
        tramos: Dict[UUID, Dict],
        diametros_comerciales: List[float],
        costo_por_metro: float = 100.0,  # Soles por metro
        presion_minima: float = 10.0,  # m.c.a.
        tolerancia_presion: float = 0.5,  # m.c.a.
        poblacion_size: int = 100,
        generaciones: int = 50,
        crossover_rate: float = 0.8,
        mutation_rate: float = 0.1,
        elitismo: int = 5
    ):
        self.nudos = nudos
        self.tramos = tramos
        self.diametros_comerciales = sorted(diametros_comerciales)
        self.costo_por_metro = costo_por_metro
        self.presion_minima = presion_minima
        self.tolerancia_presion = tolerancia_presion
        self.poblacion_size = poblacion_size
        self.generaciones = generaciones
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.elitismo = elitismo
        
        # Métricas
        self.historial_aptitud: List[Dict] = []
        self.mejor_individuo: Optional[Individuo] = None
        
    def _inicializar_poblacion(self) -> List[Individuo]:
        """Crea la población inicial"""
        poblacion = []
        
        for _ in range(self.poblacion_size):
            cromosoma = [
                random.choice(self.diametros_comerciales)
                for _ in range(len(self.tramos))
            ]
            individuo = Individuo(cromosoma=cromosoma)
            poblacion.append(individuo)
        
        return poblacion
    
    def _calcular_costo(self, individuo: Individuo) -> float:
        """Calcula el costo total de la red"""
        costo_total = 0.0
        
        for i, (tramo_id, tramo_data) in enumerate(self.tramos.items()):
            diametro = individuo.cromosoma[i]
            longitud = tramo_data["longitud"]
            
            # Costo proporcional al diámetro (mayor diámetro = mayor costo)
            # Factor exponencial para penalizar diámetros grandes
            factor_costo = (diametro / self.diametros_comerciales[0]) ** 1.5
            costo_tramo = longitud * self.costo_por_metro * factor_costo
            
            costo_total += costo_tramo
        
        return costo_total
    
    def _evaluar_restricciones(self, individuo: Individuo) -> Tuple[bool, float]:
        """
        Evalúa las restricciones de presión
        
        Returns:
        - factible: bool
        - penalizacion: float (mayor = peor)
        """
        penalizacion = 0.0
        factible = True
        
        # Simulación simplificada de presiones
        # En producción, usaría el motor hidráulico real
        presiones = self._simular_presiones(individuo.cromosoma)
        
        for nudo_id, presion in presiones.items():
            if presion < self.presion_minima:
                deficit = self.presion_minima - presion
                # Penalización cuadrática severa
                penalizacion += (deficit ** 2) * 1000
                factible = False
            
            # Penalización suave para presiones muy por encima del mínimo
            elif presion > self.presion_minima * 2:
                exceso = presion - self.presion_minima * 2
                penalizacion += exceso * 10
        
        return factible, penalizacion
    
    def _simular_presiones(self, cromosoma: List[float]) -> Dict[UUID, float]:
        """
        Simula las presiones en los nudos basado en los diámetros propuestos
        (Simplificación: usar distribución hidrostática)
        """
        presiones = {}
        
        # Obtener nudo de referencia (reservorio/cisterna)
        nudo_ref_id = None
        for nudo_id, nudo_data in self.nudos.items():
            if nudo_data.get("tipo") in ["reservorio", "cisterna", "tanque_elevado"]:
                nudo_ref_id = nudo_id
                break
        
        if nudo_ref_id is None:
            nudo_ref_id = list(self.nudos.keys())[0]
        
        # Presión de referencia
        presion_ref = self.nudos[nudo_ref_id].get("elevacion", 0) + 30  # 30m de columna
        
        for nudo_id, nudo_data in self.nudos.items():
            if nudo_id == nudo_ref_id:
                presiones[nudo_id] = presion_ref
                continue
            
            # Calcular distancia total desde referencia
            distancia_total = 0.0
            
            # Simplificación: buscar camino más corto
            # En producción, usaría BFS/Dijkstra
            for i, (tramo_id, tramo_data) in enumerate(self.tramos.items()):
                if (tramo_data.get("nudo_origen") == nudo_ref_id or
                    tramo_data.get("nudo_destino") == nudo_ref_id):
                    diametro = cromosoma[i]
                    longitud = tramo_data["longitud"]
                    
                    # Pérdida de carga proporcional a longitud / diámetro^4.87
                    perdida = longitud / (diametro ** 4.87) * 10000
                    distancia_total += perdida
            
            presion = presion_ref - distancia_total
            presiones[nudo_id] = max(presion, 0)
        
        return presiones
    
    def _calcular_aptitud(self, individuo: Individuo) -> float:
        """Calcula la aptitud del individuo"""
        costo = self._calcular_costo(individuo)
        factible, penalizacion = self._evaluar_restricciones(individuo)
        
        # Aptitud = costo + penalización
        # Menor es mejor
        individuo.aptitud = costo + penalizacion
        individuo.factible = factible
        
        return individuo.aptitud
    
    def _seleccionar(self, poblacion: List[Individuo]) -> Individuo:
        """Selección por tournament"""
        tournament_size = 5
        seleccionados = random.sample(poblacion, min(tournament_size, len(poblacion)))
        
        # Retornar el de menor aptitud (menor costo)
        return min(seleccionados, key=lambda x: x.aptitud)
    
    def _cruce(self, padre1: Individuo, padre2: Individuo) -> Tuple[Individuo, Individuo]:
        """Cruce de un punto"""
        if random.random() > self.crossover_rate:
            return padre1, padre2
        
        punto = random.randint(1, len(padre1.cromosoma) - 1)
        
        cromosoma1 = padre1.cromosoma[:punto] + padre2.cromosoma[punto:]
        cromosoma2 = padre2.cromosoma[:punto] + padre1.cromosoma[punto:]
        
        hijo1 = Individuo(cromosoma=cromosoma1)
        hijo2 = Individuo(cromosoma=cromosoma2)
        
        return hijo1, hijo2
    
    def _mutar(self, individuo: Individuo) -> Individuo:
        """Mutación de un gen"""
        if random.random() < self.mutation_rate:
            punto = random.randint(0, len(individuo.cromosoma) - 1)
            individuo.cromosoma[punto] = random.choice(self.diametros_comerciales)
        
        return individuo
    
    def optimizar(self) -> Dict:
        """
        Ejecuta el algoritmo genético
        
        Returns:
        - Dict con resultados de la optimización
        """
        inicio = time.time()
        
        print("=" * 60)
        print("OPTIMIZACIÓN DE DIÁMETROS - ALGORITMO GENÉTICO")
        print("=" * 60)
        print(f"Población: {self.poblacion_size}")
        print(f"Generaciones: {self.generaciones}")
        print(f"Tasa de cruce: {self.crossover_rate}")
        print(f"Tasa de mutación: {self.mutation_rate}")
        print(f"Diámetros disponibles: {self.diametros_comerciales}")
        print()
        
        # Inicializar población
        poblacion = self._inicializar_poblacion()
        
        # Evaluar población inicial
        for ind in poblacion:
            self._calcular_aptitud(ind)
        
        # Ordenar por aptitud (menor es mejor)
        poblacion.sort(key=lambda x: x.aptitud)
        self.mejor_individuo = poblacion[0]
        
        # Guardar historial
        self.historial_aptitud.append({
            "generacion": 0,
            "mejor_aptitud": poblacion[0].aptitud,
            "peor_aptitud": poblacion[-1].aptitud,
            "aptitud_promedio": sum(i.aptitud for i in poblacion) / len(poblacion),
            "factibles": sum(1 for i in poblacion if i.factible)
        })
        
        print(f"Generación 0: Mejor={poblacion[0].aptitud:.2f}, Factibles={sum(1 for i in poblacion if i.factible)}/{len(poblacion)}")
        
        # Evolución
        for gen in range(1, self.generaciones + 1):
            nueva_poblacion = []
            
            # Elitismo
            nueva_poblacion.extend(poblacion[:self.elitismo])
            
            # Generar nueva población
            while len(nueva_poblacion) < self.poblacion_size:
                # Selección
                padre1 = self._seleccionar(poblacion)
                padre2 = self._seleccionar(poblacion)
                
                # Cruce
                hijo1, hijo2 = self._cruce(padre1, padre2)
                
                # Mutación
                hijo1 = self._mutar(hijo1)
                hijo2 = self._mutar(hijo2)
                
                # Evaluación
                self._calcular_aptitud(hijo1)
                self._calcular_aptitud(hijo2)
                
                nueva_poblacion.extend([hijo1, hijo2])
            
            # Recortar si excede tamaño
            nueva_poblacion = nueva_poblacion[:self.poblacion_size]
            
            # Ordenar
            nueva_poblacion.sort(key=lambda x: x.aptitud)
            poblacion = nueva_poblacion
            
            # Actualizar mejor
            if poblacion[0].aptitud < self.mejor_individuo.aptitud:
                self.mejor_individuo = Individuo(
                    cromosoma=poblacion[0].cromosoma.copy(),
                    aptitud=poblacion[0].aptitud,
                    factible=poblacion[0].factible
                )
            
            # Guardar historial
            factibles_count = sum(1 for i in poblacion if i.factible)
            self.historial_aptitud.append({
                "generacion": gen,
                "mejor_aptitud": poblacion[0].aptitud,
                "peor_aptitud": poblacion[-1].aptitud,
                "aptitud_promedio": sum(i.aptitud for i in poblacion) / len(poblacion),
                "factibles": factibles_count
            })
            
            if gen % 10 == 0 or gen == self.generaciones:
                print(f"Generación {gen}: Mejor={poblacion[0].aptitud:.2f}, Factibles={factibles_count}/{self.poblacion_size}")
        
        tiempo_total = time.time() - inicio
        
        # Preparar respuesta
        return {
            "convergencia": self.mejor_individuo.factible,
            "costo_total": self._calcular_costo(self.mejor_individuo),
            "generaciones": self.generaciones,
            "tiempo_optimizacion": tiempo_total,
            "diametros_propuestos": {
                tramo_id: self.mejor_individuo.cromosoma[i]
                for i, tramo_id in enumerate(self.tramos.keys())
            },
            "historial": self.historial_aptitud,
            "mejora_porcentual": self._calcular_mejora()
        }
    
    def _calcular_mejora(self) -> float:
        """Calcula el porcentaje de mejora vs. solución inicial"""
        if len(self.historial_aptitud) < 2:
            return 0.0
        
        aptitud_inicial = self.historial_aptitud[0]["mejor_aptitud"]
        aptitud_final = self.historial_aptitud[-1]["mejor_aptitud"]
        
        if aptitud_inicial == 0:
            return 0.0
        
        mejora = (aptitud_inicial - aptitud_final) / aptitud_inicial * 100
        return max(0, mejora)
    
    def obtener_recomendaciones(self) -> List[Dict]:
        """Obtiene recomendaciones de diámetros"""
        if self.mejor_individuo is None:
            return []
        
        recomendaciones = []
        
        for i, tramo_id in enumerate(self.tramos.keys()):
            diametro_actual = self.tramos[tramo_id].get("diametro_interior", 0)
            diametro_optimizado = self.mejor_individuo.cromosoma[i]
            
            if abs(diametro_optimizado - diametro_actual) > 1:
                cambio = "aumentar" if diametro_optimizado > diametro_actual else "reducir"
                
                recomendaciones.append({
                    "tramo_id": str(tramo_id),
                    "diametro_actual": diametro_actual,
                    "diametro_propuesto": diametro_optimizado,
                    "accion": cambio,
                    "costo_estimado": self._calcular_costo(self.mejor_individuo)
                })
        
        return recomendaciones
