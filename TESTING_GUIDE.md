# 🧪 Guía de Pruebas - HidroAliaga

Esta guía explica cómo ejecutar todas las pruebas del sistema de aislamiento de datos.

---

## 📋 Índice

1. [Pruebas de Verificación](#pruebas-de-verificación)
2. [Tests Unitarios](#tests-unitarios)
3. [Tests de Integración](#tests-de-integración)
4. [Pruebas de Estrés](#pruebas-de-estrés)
5. [Pruebas Manuales](#pruebas-manuales)

---

## Pruebas de Verificación

Verifica que todos los archivos estén en su lugar.

```bash
# Desde la raíz del proyecto
python verify_files.py
```

**Resultado esperado:**
```
[OK] Modulo de autenticacion JWT
[OK] Router proyectos
[OK] Modelo Proyecto
...
RESULTADO: [OK] TODOS LOS ARCHIVOS ESTAN EN SU LUGAR
```

---

## Tests Unitarios

Pruebas del sistema de autenticación.

### Requisitos
```bash
cd backend
pip install pytest pytest-asyncio
```

### Ejecución
```bash
# Todos los tests
pytest tests/test_auth.py -v

# Con cobertura
pytest tests/test_auth.py --cov=app --cov-report=html
```

### Tests incluidos
- ✅ `test_user_auth_creation` - Creación de usuarios
- ✅ `test_user_admin_detection` - Detección de admins
- ✅ `test_verify_valid_token` - Validación JWT
- ✅ `test_verify_expired_token` - Tokens expirados
- ✅ `test_verify_invalid_token` - Tokens inválidos
- ✅ `test_authorization_error` - Manejo de errores

---

## Tests de Integración

Pruebas de los endpoints con autenticación.

### Ejecución
```bash
cd backend

# Iniciar backend primero
uvicorn main:app --reload

# En otra terminal
pytest tests/test_integration.py -v
```

### Escenarios probados
- ✅ Acceso sin token → 401
- ✅ Acceso con token → 200
- ✅ Acceso a proyecto propio → 200
- ✅ Acceso a proyecto ajeno → 403
- ✅ Modificación no autorizada → 403

---

## Pruebas de Estrés

Simula carga concurrente de usuarios.

### Ejecución básica
```bash
cd backend/tests
python stress_test.py
```

### Opciones avanzadas
```bash
# 50 usuarios concurrentes, 500 peticiones
python stress_test.py --users 50 --requests 500

# Contra servidor remoto
python stress_test.py --url https://api.tusitio.com

# Con timeout
python stress_test.py --duration 120  # 2 minutos
```

### Resultado esperado
```
📊 Estadísticas Generales:
   Total peticiones: 100
   Exitosas: 98 (98.0%)
   Tiempo total: 15.32s
   Peticiones/segundo: 6.53

✅ RESULTADO: EXCELENTE
```

---

## Pruebas Manuales

### 1. Verificar Autenticación

```bash
# Sin token - debe fallar con 401
curl http://localhost:8000/api/v1/proyectos/

# Respuesta esperada:
# {"detail":"No se proporcionó token de autenticación"}
```

### 2. Obtener Token de Prueba

```bash
# Login en el frontend
# Abrir DevTools > Application > Local Storage
# Copiar el valor de 'sb-access-token'
```

### 3. Acceder con Token

```bash
# Con token válido
curl -H "Authorization: Bearer TU_TOKEN" \
     http://localhost:8000/api/v1/proyectos/

# Respuesta esperada:
# [{"id": "...", "nombre": "Proyecto 1", ...}]
```

### 4. Verificar Aislamiento

```bash
# Usuario A crea proyecto
# Guardar el ID del proyecto

# Usuario B intenta acceder
curl -H "Authorization: Bearer TOKEN_USUARIO_B" \
     http://localhost:8000/api/v1/proyectos/ID_PROYECTO_A

# Respuesta esperada:
# {"detail":"No tienes permiso para acceder a este proyecto"}
# Status: 403 Forbidden
```

---

## 🎯 Casos de Prueba Recomendados

### Caso 1: Usuario Nuevo
1. Crear cuenta de usuario
2. Verificar que no ve proyectos existentes
3. Crear un proyecto
4. Verificar que solo ve ese proyecto
5. Logout y login con otro usuario
6. Verificar que no ve el proyecto del primer usuario

### Caso 2: Concurrencia
1. Abrir dos navegadores
2. Login con Usuario A en uno
3. Login con Usuario B en otro
4. Ambos crear proyectos simultáneamente
5. Verificar que cada uno solo ve sus proyectos

### Caso 3: Intentos de Acceso No Autorizado
1. Usuario A obtiene ID de proyecto de Usuario B
2. Intentar acceder directamente via URL
3. Verificar que recibe 403 Forbidden

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Mínimo Aceptable |
|---------|----------|------------------|
| Tests pasando | 100% | >90% |
| Autenticación | 100% exitosa | >95% |
| Aislamiento | 100% | 100% |
| Tiempo respuesta | <500ms | <2000ms |
| Tasa de error | <1% | <5% |

---

## 🔧 Troubleshooting

### Error: "No module named 'jwt'"
```bash
pip install pyjwt
```

### Error: "SUPABASE_JWT_SECRET not set"
1. Ir a Supabase Dashboard > Settings > API
2. Copiar JWT Secret
3. Agregar a `backend/.env`:
```
SUPABASE_JWT_SECRET=tu-secret
```

### Error: "Cannot connect to localhost:8000"
```bash
# Verificar que backend está corriendo
curl http://localhost:8000/health

# Si no responde, iniciar:
cd backend
uvicorn main:app --reload
```

### Error: "401 Unauthorized" con token válido
```bash
# Verificar que el token no expiró
# Obtener nuevo token desde el frontend
# Verificar formato: "Bearer token" (con espacio)
```

---

## 📈 Reportes

Los reportes de pruebas se generan automáticamente:

- `verify_files.py` - Reporte en consola
- `pytest` - Reporte HTML con `--cov-report=html`
- `stress_test.py` - Estadísticas detalladas

---

## ✅ Checklist Final

Antes de subir a producción:

- [ ] `verify_files.py` pasa todas las verificaciones
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Pruebas de estrés >85% éxito
- [ ] Pruebas manuales completadas
- [ ] Aislamiento verificado con 2+ usuarios
- [ ] Documentación actualizada

---

**Nota:** Consulta `TESTING_REPORT.md` para el reporte completo de implementación.
