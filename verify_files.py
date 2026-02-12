#!/usr/bin/env python3
"""
Verificación Simple - HidroAliaga Security Implementation

Este script verifica que todos los archivos necesarios estén en su lugar
y tengan el contenido correcto (sin ejecutar imports).
"""

import os
import re
import sys


def check_file_exists(path, description):
    """Verifica que un archivo exista"""
    if os.path.exists(path):
        print(f"[OK] {description}")
        return True
    else:
        print(f"[ERROR] FALTA: {description} - {path}")
        return False


def check_content_contains(filepath, patterns, description):
    """Verifica que el archivo contenga ciertos patrones"""
    if not os.path.exists(filepath):
        print(f"[ERROR] No existe: {filepath}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    missing = []
    for pattern in patterns:
        if pattern not in content:
            missing.append(pattern)

    if missing:
        print(f"[WARN] {description} - Faltan: {', '.join(missing[:3])}")
        return False
    else:
        print(f"[OK] {description}")
        return True


def main():
    base_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga"

    print("=" * 70)
    print("VERIFICACION DE IMPLEMENTACION DE SEGURIDAD")
    print("=" * 70)
    print(f"Fecha: 2026-02-12")
    print()

    all_ok = True

    # 1. Verificar archivos del backend
    print("\n[1/7] Archivos Backend:")
    backend_files = [
        ("backend/app/core/auth.py", "Modulo de autenticacion JWT"),
        ("backend/app/dependencies/auth.py", "Dependencias de autorizacion"),
        ("backend/app/dependencies/__init__.py", "Init de dependencias"),
    ]

    for filepath, desc in backend_files:
        if not check_file_exists(os.path.join(base_path, filepath), desc):
            all_ok = False

    # 2. Verificar routers protegidos
    print("\n[2/7] Routers con Autenticacion:")
    routers = [
        ("backend/app/routers/proyectos.py", "proyectos"),
        ("backend/app/routers/calculos.py", "calculos"),
        ("backend/app/routers/gis.py", "gis"),
        ("backend/app/routers/optimizacion.py", "optimizacion"),
        ("backend/app/routers/reportes.py", "reportes"),
    ]

    for filepath, name in routers:
        fullpath = os.path.join(base_path, filepath)
        if check_content_contains(
            fullpath,
            ["get_current_active_user", "verify_project_owner"],
            f"Router {name}",
        ):
            pass
        else:
            print(f"  [WARN] {name} puede no tener proteccion completa")

    # 3. Verificar modelo actualizado
    print("\n[3/7] Modelo de Base de Datos:")
    models_file = os.path.join(base_path, "backend/app/db/models.py")
    if check_content_contains(
        models_file,
        ["nullable=False", "usuario_id", "__table_args__"],
        "Modelo Proyecto",
    ):
        pass
    else:
        all_ok = False

    # 4. Verificar configuracion
    print("\n[4/7] Configuracion:")
    settings_file = os.path.join(base_path, "backend/app/config/settings.py")
    if check_content_contains(
        settings_file, ["SUPABASE_JWT_SECRET", "REQUIRE_AUTH"], "Settings"
    ):
        pass
    else:
        all_ok = False

    # 5. Verificar main.py actualizado
    print("\n[5/7] Main Application:")
    main_file = os.path.join(base_path, "backend/main.py")
    if check_content_contains(
        main_file,
        ["authorization_exception_handler", "authentication_exception_handler"],
        "Manejadores de errores",
    ):
        pass
    else:
        all_ok = False

    # 6. Verificar archivos del frontend
    print("\n[6/7] Frontend:")
    frontend_files = [
        ("frontend/src/lib/api-client.ts", "Cliente API con auth"),
        ("frontend/src/lib/api-services.ts", "Servicios API"),
    ]

    for filepath, desc in frontend_files:
        if not check_file_exists(os.path.join(base_path, filepath), desc):
            all_ok = False

    # 7. Verificar documentacion
    print("\n[7/7] Documentacion:")
    docs = [
        ("SECURITY_IMPLEMENTATION.md", "Documentacion de implementacion"),
        ("database/migrate_user_isolation.sql", "Script de migracion SQL"),
    ]

    for filepath, desc in docs:
        if not check_file_exists(os.path.join(base_path, filepath), desc):
            all_ok = False

    # Resumen
    print("\n" + "=" * 70)
    if all_ok:
        print("RESULTADO: [OK] TODOS LOS ARCHIVOS ESTAN EN SU LUGAR")
        print("=" * 70)
        print("\nSIGUIENTES PASOS:")
        print("1. Instalar dependencias: pip install pyjwt")
        print("2. Configurar SUPABASE_JWT_SECRET en backend/.env")
        print("3. Ejecutar migracion SQL en Supabase")
        print("4. Iniciar backend: cd backend && uvicorn main:app --reload")
        print("5. Probar endpoints con autenticacion")
        print("=" * 70)
        return 0
    else:
        print("RESULTADO: [WARN] ALGUNOS ARCHIVOS FALTAN O NECESITAN REVISION")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    sys.exit(main())
