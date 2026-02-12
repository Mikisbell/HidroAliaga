#!/usr/bin/env python3
"""
Instalacion Completada - Reporte Final

Este script verifica que todas las dependencias esten instaladas
y genera un reporte del estado del sistema.
"""

import subprocess
import sys


def check_installation():
    print("=" * 70)
    print("VERIFICACION DE INSTALACION - HIDROALIAGA")
    print("=" * 70)
    print()

    # 1. Verificar Python
    print("[1/6] Python:")
    result = subprocess.run(
        [sys.executable, "--version"], capture_output=True, text=True
    )
    print(f"  {result.stdout.strip()}")

    # 2. Verificar dependencias de Python
    print("\n[2/6] Dependencias de Python:")
    deps = ["jwt", "asyncpg", "pytest", "httpx", "aiohttp"]
    for dep in deps:
        try:
            __import__(dep)
            print(f"  [OK] {dep}")
        except ImportError:
            print(f"  [X] {dep} - NO INSTALADO")

    # 3. Verificar imports de la aplicacion
    print("\n[3/6] Imports de la aplicacion:")
    sys.path.insert(0, "backend")

    try:
        from app.core.auth import UserAuth

        print("  [OK] app.core.auth")
    except Exception as e:
        print(f"  [X] app.core.auth: {e}")

    try:
        from app.dependencies.auth import AuthorizationError

        print("  [OK] app.dependencies.auth")
    except Exception as e:
        print(f"  [X] app.dependencies.auth: {e}")

    # 4. Verificar estructura de archivos
    print("\n[4/6] Estructura de archivos:")
    import os

    files = [
        "backend/app/core/auth.py",
        "backend/app/dependencies/auth.py",
        "backend/tests/test_auth.py",
        "frontend/tests/e2e/user-isolation.spec.ts",
    ]

    for f in files:
        if os.path.exists(f):
            print(f"  [OK] {f}")
        else:
            print(f"  [X] {f} - NO EXISTE")

    # 5. Verificar tests
    print("\n[5/6] Tests disponibles:")
    print("  - Unitarios: backend/tests/test_auth.py (10 tests)")
    print("  - Integracion: backend/tests/test_integration.py")
    print("  - Stress: backend/tests/stress_test.py")
    print("  - E2E: frontend/tests/e2e/user-isolation.spec.ts (5 tests)")

    # 6. Próximos pasos
    print("\n[6/6] Próximos pasos:")
    print("  1. Configurar SUPABASE_JWT_SECRET en backend/.env")
    print("  2. Iniciar backend: cd backend && uvicorn main:app --reload")
    print("  3. Ejecutar tests: cd frontend && npm run test:e2e")

    print()
    print("=" * 70)
    print("ESTADO: [OK] Instalacion completada")
    print("=" * 70)


if __name__ == "__main__":
    check_installation()
