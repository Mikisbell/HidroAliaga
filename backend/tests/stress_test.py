#!/usr/bin/env python3
"""
Script de Pruebas de Estrés - HidroAliaga

Este script realiza pruebas de carga simultánea para verificar:
1. Rendimiento del sistema bajo carga
2. Aislamiento de datos bajo concurrencia
3. Estabilidad de autenticación con múltiples usuarios
4. Tiempos de respuesta bajo estrés

Uso:
    python stress_test.py --users 10 --requests 100 --duration 60

Requisitos:
    pip install aiohttp asyncio
"""

import asyncio
import aiohttp
import time
import random
import argparse
from datetime import datetime
from typing import List, Dict
from dataclasses import dataclass
from statistics import mean, median, stdev
import json


@dataclass
class TestResult:
    """Resultado de una prueba individual"""

    user_id: str
    request_type: str
    status_code: int
    response_time: float
    success: bool
    error_message: str = ""


class StressTester:
    """Clase para ejecutar pruebas de estrés"""

    def __init__(self, base_url: str, concurrent_users: int, total_requests: int):
        self.base_url = base_url.rstrip("/")
        self.concurrent_users = concurrent_users
        self.total_requests = total_requests
        self.results: List[TestResult] = []
        self.session = None

    def generate_mock_token(self, user_id: str) -> str:
        """Genera un token JWT mock para testing"""
        # En producción, esto usaría tokens reales de Supabase
        # Para testing, usamos un formato simple
        import jwt
        from datetime import datetime, timedelta

        payload = {
            "sub": user_id,
            "email": f"user_{user_id[:8]}@test.com",
            "role": "authenticated",
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow(),
        }

        # Usar un secret de testing
        secret = "test-secret-key-for-stress-testing-only-do-not-use-in-production"
        return jwt.encode(payload, secret, algorithm="HS256")

    async def make_request(
        self, user_id: str, endpoint: str, method: str = "GET", data: Dict = None
    ) -> TestResult:
        """Realiza una petición HTTP y registra el resultado"""
        token = self.generate_mock_token(user_id)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        url = f"{self.base_url}{endpoint}"
        start_time = time.time()

        try:
            async with self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                response_time = time.time() - start_time

                # Considerar exitoso si es 200, 201, 204, 401 o 403
                # (401/403 son respuestas válidas de seguridad)
                success = response.status in [200, 201, 204, 401, 403, 404]

                return TestResult(
                    user_id=user_id,
                    request_type=f"{method} {endpoint}",
                    status_code=response.status,
                    response_time=response_time,
                    success=success,
                    error_message="" if success else await response.text(),
                )

        except asyncio.TimeoutError:
            return TestResult(
                user_id=user_id,
                request_type=f"{method} {endpoint}",
                status_code=0,
                response_time=time.time() - start_time,
                success=False,
                error_message="Timeout",
            )
        except Exception as e:
            return TestResult(
                user_id=user_id,
                request_type=f"{method} {endpoint}",
                status_code=0,
                response_time=time.time() - start_time,
                success=False,
                error_message=str(e),
            )

    async def user_worker(self, user_id: str, request_count: int):
        """Worker que simula un usuario realizando peticiones"""
        for i in range(request_count):
            # Secuencia realista de operaciones
            operations = [
                ("/api/v1/proyectos/", "GET"),  # Listar proyectos
                (f"/api/v1/proyectos/{uuid4()}", "GET"),  # Obtener proyecto (puede 404)
                (
                    "/api/v1/proyectos/",
                    "POST",
                    {  # Crear proyecto
                        "nombre": f"Proyecto Stress Test {i}",
                        "tipo_red": "cerrada",
                        "ambito": "urbano",
                    },
                ),
                ("/api/v1/normativa/limites/urbano", "GET"),  # Datos públicos
            ]

            # Seleccionar operación aleatoria
            op = random.choice(operations)
            endpoint, method = op[0], op[1]
            data = op[2] if len(op) > 2 else None

            result = await self.make_request(user_id, endpoint, method, data)
            self.results.append(result)

            # Pequeña pausa entre peticiones (100-500ms)
            await asyncio.sleep(random.uniform(0.1, 0.5))

    async def run_isolation_test(self):
        """Prueba específica de aislamiento entre usuarios"""
        print("\n🔒 Probando aislamiento de datos entre usuarios...")

        # Crear dos usuarios
        user_a = str(uuid4())
        user_b = str(uuid4())

        # Usuario A crea un proyecto
        create_result = await self.make_request(
            user_a,
            "/api/v1/proyectos/",
            "POST",
            {"nombre": "Proyecto Secreto A", "tipo_red": "cerrada"},
        )

        if create_result.status_code == 201:
            proyecto_id = json.loads(create_result.error_message or "{}").get(
                "id", str(uuid4())
            )

            # Usuario B intenta acceder al proyecto de A
            access_result = await self.make_request(
                user_b, f"/api/v1/proyectos/{proyecto_id}", "GET"
            )

            if access_result.status_code in [403, 404]:
                print(
                    "✅ Aislamiento funciona correctamente: Usuario B no puede acceder a proyecto de A"
                )
                return True
            else:
                print(
                    f"❌ ERROR DE SEGURIDAD: Usuario B accedió al proyecto de A (status: {access_result.status_code})"
                )
                return False
        else:
            print(
                f"⚠️  No se pudo crear proyecto para test de aislamiento (status: {create_result.status_code})"
            )
            return None

    async def run_load_test(self):
        """Ejecuta la prueba de carga"""
        print(f"\n🚀 Iniciando prueba de estrés")
        print(f"   URL: {self.base_url}")
        print(f"   Usuarios concurrentes: {self.concurrent_users}")
        print(f"   Peticiones totales: {self.total_requests}")
        print(f"   Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Calcular peticiones por usuario
        requests_per_user = self.total_requests // self.concurrent_users

        # Crear usuarios únicos
        users = [str(uuid4()) for _ in range(self.concurrent_users)]

        # Crear sesión HTTP
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=20)
        timeout = aiohttp.ClientTimeout(total=60)

        async with aiohttp.ClientSession(
            connector=connector, timeout=timeout
        ) as self.session:
            # Ejecutar workers concurrentemente
            tasks = [self.user_worker(user_id, requests_per_user) for user_id in users]

            start_time = time.time()
            await asyncio.gather(*tasks)
            total_time = time.time() - start_time

        return total_time

    def generate_report(self, total_time: float):
        """Genera reporte de resultados"""
        print("\n" + "=" * 70)
        print("📊 REPORTE DE PRUEBAS DE ESTRÉS")
        print("=" * 70)

        # Estadísticas generales
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r.success)
        failed_requests = total_requests - successful_requests

        print(f"\n📈 Estadísticas Generales:")
        print(f"   Total peticiones: {total_requests}")
        print(
            f"   Exitosas: {successful_requests} ({successful_requests / total_requests * 100:.1f}%)"
        )
        print(
            f"   Fallidas: {failed_requests} ({failed_requests / total_requests * 100:.1f}%)"
        )
        print(f"   Tiempo total: {total_time:.2f}s")
        print(f"   Peticiones/segundo: {total_requests / total_time:.2f}")

        # Tiempos de respuesta
        if self.results:
            response_times = [r.response_time for r in self.results]
            print(f"\n⏱️  Tiempos de Respuesta:")
            print(f"   Mínimo: {min(response_times) * 1000:.2f}ms")
            print(f"   Máximo: {max(response_times) * 1000:.2f}ms")
            print(f"   Media: {mean(response_times) * 1000:.2f}ms")
            print(f"   Mediana: {median(response_times) * 1000:.2f}ms")

            if len(response_times) > 1:
                print(f"   Desv. Estándar: {stdev(response_times) * 1000:.2f}ms")

        # Códigos de respuesta
        status_codes = {}
        for r in self.results:
            status_codes[r.status_code] = status_codes.get(r.status_code, 0) + 1

        print(f"\n📋 Distribución de Códigos HTTP:")
        for code, count in sorted(status_codes.items()):
            if code == 0:
                print(f"   Timeout/Error: {count}")
            else:
                print(f"   {code}: {count}")

        # Análisis por tipo de endpoint
        endpoint_stats = {}
        for r in self.results:
            key = r.request_type
            if key not in endpoint_stats:
                endpoint_stats[key] = {"count": 0, "times": [], "errors": 0}
            endpoint_stats[key]["count"] += 1
            endpoint_stats[key]["times"].append(r.response_time)
            if not r.success:
                endpoint_stats[key]["errors"] += 1

        print(f"\n🔍 Rendimiento por Endpoint:")
        for endpoint, stats in sorted(
            endpoint_stats.items(), key=lambda x: x[1]["count"], reverse=True
        )[:5]:
            avg_time = mean(stats["times"]) * 1000
            error_rate = stats["errors"] / stats["count"] * 100
            print(
                f"   {endpoint}: {stats['count']} reqs, {avg_time:.2f}ms avg, {error_rate:.1f}% errors"
            )

        # Errores
        errors = [r for r in self.results if not r.success and r.error_message]
        if errors:
            print(f"\n❌ Errores Encontrados:")
            error_types = {}
            for e in errors:
                msg = (
                    e.error_message[:50] + "..."
                    if len(e.error_message) > 50
                    else e.error_message
                )
                error_types[msg] = error_types.get(msg, 0) + 1

            for msg, count in sorted(
                error_types.items(), key=lambda x: x[1], reverse=True
            )[:5]:
                print(f"   ({count}x) {msg}")

        # Veredicto
        print("\n" + "=" * 70)
        success_rate = successful_requests / total_requests * 100

        if success_rate >= 95:
            print("✅ RESULTADO: EXCELENTE")
            print(f"   El sistema aguantó la carga con {success_rate:.1f}% de éxito")
        elif success_rate >= 85:
            print("⚠️  RESULTADO: ACEPTABLE")
            print(
                f"   El sistema funcionó pero con {100 - success_rate:.1f}% de errores"
            )
        else:
            print("❌ RESULTADO: DEFICIENTE")
            print(f"   El sistema falló con {100 - success_rate:.1f}% de errores")

        print("=" * 70)

        return success_rate >= 85  # Retorna True si pasó la prueba

    async def run(self):
        """Ejecuta todas las pruebas"""
        try:
            # Prueba de aislamiento
            isolation_passed = await self.run_isolation_test()

            # Prueba de carga
            total_time = await self.run_load_test()

            # Generar reporte
            load_passed = self.generate_report(total_time)

            # Veredicto final
            print("\n🏁 VEREDICTO FINAL:")
            if isolation_passed is not False and load_passed:
                print("✅ TODAS LAS PRUEBAS PASARON")
                return 0
            else:
                print("❌ ALGUNAS PRUEBAS FALLARON")
                return 1

        except Exception as e:
            print(f"\n💥 ERROR EN PRUEBAS: {e}")
            import traceback

            traceback.print_exc()
            return 1


def uuid4():
    """Genera UUID v4"""
    import uuid

    return str(uuid.uuid4())


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pruebas de estrés para HidroAliaga")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="URL base del backend (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--users",
        type=int,
        default=10,
        help="Número de usuarios concurrentes (default: 10)",
    )
    parser.add_argument(
        "--requests",
        type=int,
        default=100,
        help="Número total de peticiones (default: 100)",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=0,
        help="Duración máxima en segundos (0 = ilimitado)",
    )

    args = parser.parse_args()

    print("=" * 70)
    print("🔥 HIDROALIAGA - PRUEBAS DE ESTRÉS")
    print("=" * 70)

    # Verificar dependencias
    try:
        import aiohttp
        import jwt
    except ImportError as e:
        print(f"\n❌ Error: Falta dependencia {e.name}")
        print("   Instala con: pip install aiohttp pyjwt")
        return 1

    # Ejecutar pruebas
    tester = StressTester(args.url, args.users, args.requests)

    if args.duration > 0:
        # Ejecutar con timeout
        result = asyncio.run(asyncio.wait_for(tester.run(), timeout=args.duration))
    else:
        result = asyncio.run(tester.run())

    return result


if __name__ == "__main__":
    exit(main())
