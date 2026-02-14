# Guía de Desarrollo Profesional - HidroAliaga

## 1. Flujo de Trabajo con Git (Git Flow)
Para mantener el código ordenado y estable, seguimos este estándar:

- **Ramas (Branches)**:
  - `main`: Código de producción. **Nunca** trabajar directamente aquí.
  - `dev` (Opcional): Rama de integración.
  - `feat/nombre-funcionalidad`: Para nuevas características (ej. `feat/calculo-presion`).
  - `fix/nombre-bug`: Para correcciones de errores (ej. `fix/error-login`).

- **Proceso de Commit**:
  - Usar "Conventional Commits":
    - `feat:` Nueva funcionalidad
    - `fix:` Corrección de bug
    - `docs:` Cambios en documentación
    - `style:` Formato (espacios, puntos y comas)
    - `refactor:` Mejora de código sin cambiar funcionalidad

## 2. Base de Datos (Supabase)
**Regla de Oro**: Nunca modificar la estructura de la BD manualmente en producción.

- **Migraciones**:
  - Usar PostgreSQL migrations para cambios de esquema.
  - Los scripts SQL deben guardarse en `database/migrations/`.
  - Ejemplo: `20240214_enable_rls.sql`.

- **Seguridad**:
  - **RLS (Row Level Security)** siempre activado.
  - Nunca commitear archivos `.env` con credenciales reales.

## 3. Calidad de Código (QA)
Antes de subir cambios (`push`), ejecutar siempre:

```bash
# Frontend
cd frontend
npm run lint    # Verificar estilo
npm test        # Verificar que no rompiste nada
npm run build   # Verificar compilación

# Backend
cd backend
# Ejecutar tests de Python si existen
```

## 4. Despliegue (Deployment)
- El entorno de **Vercel** detectará automáticamente los cambios en `main` y desplegará.
- Si el `npm run build` falla en local, fallará en producción. Corregir antes de subir.
