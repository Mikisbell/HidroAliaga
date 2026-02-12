#!/usr/bin/env python3
"""
Script de Verificación Completa - HidroAliaga

Este script verifica que todo el sistema de aislamiento de datos esté funcionando correctamente.
Realiza pruebas secuenciales y reporta el estado de cada componente.

Uso:
    python verify_system.py

Requisitos:
    - Backend corriendo en http://localhost:8000
    - Base de datos accesible
    - Variables de entorno configuradas
"""

import sys
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple


# Colores para output
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    END = "\033[0m"
    BOLD = "\033[1m"


def print_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")


def print_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")


def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")


def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")


def print_header(msg: str):
    print(f"\n{Colors.BOLD}{'=' * 70}{Colors.END}")
    print(f"{Colors.BOLD}{msg}{Colors.END}")
    print(f"{Colors.BOLD}{'=' * 70}{Colors.END}")


class SystemVerifier:
    """Verificador del sistema de aislamiento"""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results: List[Tuple[str, bool, str]] = []

    def run_all_checks(self):
        """Ejecuta todas las verificaciones"""
        print_header("VERIFICACIÓN DEL SISTEMA HIDROALIAGA")
        print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"URL Backend: {self.base_url}")

        # Verificaciones
        checks = [
            ("Importación de módulos", self.check_imports),
            ("Configuración de variables", self.check_environment),
            ("Estructura de archivos", self.check_file_structure),
            ("Modelos de base de datos", self.check_models),
            ("Sistema de autenticación", self.check_auth_system),
            ("Routers protegidos", self.check_routers),
            ("Endpoints de autenticación", self.check_auth_endpoints),
            ("Dependencias de auth", self.check_auth_dependencies),
            ("Middleware de errores", self.check_error_handlers),
            ("Cliente API Frontend", self.check_frontend_client),
        ]

        for name, check_func in checks:
            try:
                success, message = check_func()
                self.results.append((name, success, message))
                if success:
                    print_success(f"{name}: {message}")
                else:
                    print_error(f"{name}: {message}")
            except Exception as e:
                self.results.append((name, False, str(e)))
                print_error(f"{name}: {str(e)}")

        # Reporte final
        self.print_final_report()

    def check_imports(self) -> Tuple[bool, str]:
        """Verifica que todos los módulos se puedan importar"""
        try:
            import sys

            sys.path.insert(
                0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend"
            )

            # Intentar importar módulos críticos
            from app.core.auth import UserAuth, verify_supabase_token
            from app.dependencies.auth import AuthorizationError, verify_project_owner
            from app.db.models import Proyecto
            from app.config.settings import settings

            return True, "Todos los módulos importados correctamente"
        except ImportError as e:
            return False, f"Error importando módulos: {e}"
        except Exception as e:
            return False, f"Error inesperado: {e}"

    def check_environment(self) -> Tuple[bool, str]:
        """Verifica configuración de variables de entorno"""
        try:
            import sys

            sys.path.insert(
                0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend"
            )
            from app.config.settings import settings

            checks = []

            # Verificar variables críticas
            if (
                hasattr(settings, "SUPABASE_JWT_SECRET")
                and settings.SUPABASE_JWT_SECRET
            ):
                checks.append("SUPABASE_JWT_SECRET")
            else:
                return False, "SUPABASE_JWT_SECRET no configurado"

            if hasattr(settings, "REQUIRE_AUTH"):
                checks.append(f"REQUIRE_AUTH={settings.REQUIRE_AUTH}")

            if hasattr(settings, "JWT_ALGORITHM"):
                checks.append(f"JWT_ALGORITHM={settings.JWT_ALGORITHM}")

            return True, f"Configuración OK: {', '.join(checks)}"
        except Exception as e:
            return False, f"Error verificando configuración: {e}"

    def check_file_structure(self) -> Tuple[bool, str]:
        """Verifica que todos los archivos necesarios existan"""
        import os

        required_files = [
            "backend/app/core/auth.py",
            "backend/app/dependencies/auth.py",
            "backend/app/dependencies/__init__.py",
            "backend/app/routers/proyectos.py",
            "backend/app/routers/calculos.py",
            "backend/app/routers/gis.py",
            "backend/app/routers/optimizacion.py",
            "backend/app/routers/normativa.py",
            "backend/app/routers/reportes.py",
            "frontend/src/lib/api-client.ts",
            "frontend/src/lib/api-services.ts",
        ]

        base_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga"
        missing = []

        for file in required_files:
            full_path = os.path.join(base_path, file)
            if not os.path.exists(full_path):
                missing.append(file)

        if missing:
            return False, f"Archivos faltantes: {', '.join(missing)}"

        return True, f"Todos los {len(required_files)} archivos presentes"

    def check_models(self) -> Tuple[bool, str]:
        """Verifica que el modelo Proyecto tenga usuario_id obligatorio"""
        try:
            import sys

            sys.path.insert(
                0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend"
            )
            from app.db.models import Proyecto
            from sqlalchemy import inspect

            # Verificar que usuario_id existe
            mapper = inspect(Proyecto)
            columns = {col.name: col for col in mapper.columns}

            if "usuario_id" not in columns:
                return False, "Campo usuario_id no existe en modelo Proyecto"

            usuario_col = columns["usuario_id"]
            if usuario_col.nullable:
                return False, "Campo usuario_id es nullable (debe ser obligatorio)"

            # Verificar índices
            indexes = [idx.name for idx in mapper.indexes]
            if "idx_proyectos_usuario_id" not in indexes:
                return False, "Falta índice idx_proyectos_usuario_id"

            return True, "Modelo correctamente configurado con usuario_id NOT NULL"
        except Exception as e:
            return False, f"Error verificando modelos: {e}"

    def check_auth_system(self) -> Tuple[bool, str]:
        """Verifica el sistema de autenticación"""
        try:
            import sys

            sys.path.insert(
                0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend"
            )
            from app.core.auth import (
                UserAuth,
                verify_supabase_token,
                get_current_user,
                get_current_active_user,
            )

            # Verificar que las funciones existen
            funcs = [verify_supabase_token, get_current_user, get_current_active_user]

            # Verificar clase UserAuth
            user = UserAuth(
                id=__import__("uuid").uuid4(),
                email="test@example.com",
                role="authenticated",
            )

            if not hasattr(user, "is_admin"):
                return False, "UserAuth no tiene propiedad is_admin"

            return True, "Sistema de auth implementado correctamente"
        except Exception as e:
            return False, f"Error en sistema de auth: {e}"

    def check_routers(self) -> Tuple[bool, str]:
        """Verifica que los routers tengan protección de autenticación"""
        import ast
        import os

        base_path = (
            "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend/app/routers"
        )

        required_imports = ["get_current_active_user", "verify_project_owner"]

        routers = [
            "proyectos.py",
            "calculos.py",
            "gis.py",
            "optimizacion.py",
            "reportes.py",
        ]
        protected = []

        for router_file in routers:
            file_path = os.path.join(base_path, router_file)
            if not os.path.exists(file_path):
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

                # Verificar que importa dependencias de auth
                has_auth = any(imp in content for imp in required_imports)
                has_depends = (
                    "Depends(get_current_active_user)" in content
                    or "Depends(verify_project_owner)" in content
                )

                if has_auth and has_depends:
                    protected.append(router_file)

        if len(protected) < 4:
            return False, f"Solo {len(protected)}/5 routers tienen protección completa"

        return True, f"{len(protected)} routers protegidos con autenticación"

    def check_auth_endpoints(self) -> Tuple[bool, str]:
        """Verifica que los endpoints principales requieran auth"""
        import ast
        import os

        file_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend/app/routers/proyectos.py"

        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())

        # Buscar decoradores de router
        protected_endpoints = 0
        total_endpoints = 0

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Verificar si es un endpoint (tiene decorador router.*)
                if any(
                    isinstance(dec, ast.Attribute)
                    and dec.attr in ["get", "post", "put", "delete"]
                    for dec in node.decorator_list
                    if isinstance(dec, ast.Call)
                    for child in ast.walk(dec)
                    if isinstance(child, ast.Attribute)
                ):
                    total_endpoints += 1
                    # Verificar si tiene Depends con auth
                    for arg in node.args.args:
                        if "current_user" in arg.arg or "current_user" in str(
                            arg.annotation
                        ):
                            protected_endpoints += 1
                            break

        if total_endpoints == 0:
            return False, "No se encontraron endpoints para analizar"

        if protected_endpoints < total_endpoints * 0.8:  # Al menos 80% protegidos
            return (
                False,
                f"Solo {protected_endpoints}/{total_endpoints} endpoints protegidos",
            )

        return (
            True,
            f"{protected_endpoints}/{total_endpoints} endpoints requieren autenticación",
        )

    def check_auth_dependencies(self) -> Tuple[bool, str]:
        """Verifica dependencias de autorización"""
        try:
            import sys

            sys.path.insert(
                0, "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend"
            )
            from app.dependencies.auth import (
                AuthorizationError,
                AuthenticationError,
                verify_project_owner,
                require_project_owner,
                require_admin,
            )

            # Verificar excepciones
            auth_error = AuthorizationError("Test")
            if auth_error.status_code != 403:
                return False, "AuthorizationError no tiene status_code 403"

            return True, "Todas las dependencias de auth disponibles"
        except ImportError as e:
            return False, f"Falta importación: {e}"
        except Exception as e:
            return False, f"Error: {e}"

    def check_error_handlers(self) -> Tuple[bool, str]:
        """Verifica manejadores de errores en main.py"""
        import os

        main_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/backend/main.py"

        with open(main_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_handlers = [
            "authorization_exception_handler",
            "authentication_exception_handler",
        ]

        missing = [h for h in required_handlers if h not in content]

        if missing:
            return False, f"Faltan handlers: {', '.join(missing)}"

        return True, "Manejadores de errores de auth implementados"

    def check_frontend_client(self) -> Tuple[bool, str]:
        """Verifica que el frontend tenga cliente API con auth"""
        import os

        api_client_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/frontend/src/lib/api-client.ts"
        api_services_path = "E:/FREECLOUD/FREECLOUD-IA/PROYECTOS/HidroAliaga/frontend/src/lib/api-services.ts"

        checks = []

        if os.path.exists(api_client_path):
            with open(api_client_path, "r", encoding="utf-8") as f:
                content = f.read()
                if "Authorization" in content and "Bearer" in content:
                    checks.append("api-client.ts con auth headers")
                else:
                    return False, "api-client.ts sin headers de autorización"
        else:
            return False, "api-client.ts no existe"

        if os.path.exists(api_services_path):
            checks.append("api-services.ts presente")
        else:
            return False, "api-services.ts no existe"

        return True, f"Frontend configurado: {', '.join(checks)}"

    def print_final_report(self):
        """Imprime reporte final"""
        print_header("REPORTE FINAL DE VERIFICACIÓN")

        total = len(self.results)
        passed = sum(1 for _, success, _ in self.results if success)
        failed = total - passed

        print(f"\n📊 Estadísticas:")
        print(f"   Total checks: {total}")
        print(f"   {Colors.GREEN}Pasaron: {passed}{Colors.END}")
        print(f"   {Colors.RED}Fallaron: {failed}{Colors.END}")
        print(f"   Porcentaje: {passed / total * 100:.1f}%")

        print(f"\n📋 Detalle por Check:")
        for name, success, message in self.results:
            icon = (
                f"{Colors.GREEN}✅{Colors.END}"
                if success
                else f"{Colors.RED}❌{Colors.END}"
            )
            print(f"   {icon} {name}")

        print("\n" + "=" * 70)
        if failed == 0:
            print(
                f"{Colors.GREEN}{Colors.BOLD}✅ TODAS LAS VERIFICACIONES PASARON{Colors.END}"
            )
            print(f"{Colors.GREEN}El sistema está listo para usar{Colors.END}")
            print("=" * 70)
            return 0
        else:
            print(
                f"{Colors.RED}{Colors.BOLD}❌ ALGUNAS VERIFICACIONES FALLARON{Colors.END}"
            )
            print(
                f"{Colors.RED}Por favor corrige los errores antes de continuar{Colors.END}"
            )
            print("=" * 70)
            return 1


def main():
    """Función principal"""
    verifier = SystemVerifier()
    exit_code = verifier.run_all_checks()

    print("\n💡 PRÓXIMOS PASOS:")
    print("   1. Configurar SUPABASE_JWT_SECRET en backend/.env")
    print("   2. Ejecutar migración SQL: database/migrate_user_isolation.sql")
    print("   3. Iniciar backend: uvicorn main:app --reload")
    print("   4. Ejecutar pruebas de estrés: python tests/stress_test.py")
    print("   5. Verificar manualmente aislamiento entre usuarios")

    return exit_code


if __name__ == "__main__":
    exit(main())
