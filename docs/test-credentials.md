# Test Credentials — HidroAliaga

> ⚠️ **Solo para entorno de desarrollo/testing. No usar en producción.**

## Admin (E2E Tests)

| Campo     | Valor                     |
|-----------|---------------------------|
| Email     | `admin@hidroaliaga.com`   |
| Password  | `admin123`                |
| Rol       | `admin`                   |

### Uso

Estas credenciales se usan en:
- **E2E Tests (Playwright)**: `frontend/.env.test`
- **Login manual**: `http://localhost:3002/login`

### Comandos de Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E con UI interactiva
npm run test:e2e:ui
```
