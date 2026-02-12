# Product Requirements Document (PRD) - HidroAliaga

Documento de requisitos del producto y configuraciones pendientes.

---

## 🎯 REQUISITOS PENDIENTES

### 1. Configuración OAuth de Google (ALTA PRIORIDAD)

**Problema:** Al iniciar sesión con Google, aparece el mensaje:
```
Ir a hmwaoxbluljfqmsytyjv.supabase.co
```

**Solución Requerida:** Configurar OAuth propio de Google para que muestre:
```
Ir a Hidroaliaga
```

**Estado:** ⏳ PENDIENTE - Documentado para implementación

---

## 🔧 IMPLEMENTACIÓN: OAuth de Google

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ir a https://console.cloud.google.com/
2. Arriba donde dice **"Select a project"**, hacer clic
3. Click en **"New Project"** (arriba a la derecha)
4. **Project name**: `Hidroaliaga`
5. **Location**: Dejar "No organization"
6. Click en **"Create"**
7. Esperar y seleccionar el proyecto nuevo

### Paso 2: Configurar OAuth Consent Screen

1. Menú ☰ → **APIs & Services** → **OAuth consent screen**
2. Seleccionar **"External"** (para usuarios externos)
3. Click en **"Create"**
4. Completar campos:
   - **App name**: `Hidroaliaga`
   - **User support email**: freecloud.sac@gmail.com
   - **Developer contact information**: freecloud.sac@gmail.com
5. Click **"Save and Continue"**
6. En **Scopes**: No agregar nada, click **"Save and Continue"**
7. En **Test users**: Click **"+ Add Users"**
8. Agregar: `freecloud.sac@gmail.com`
9. Click **"Save and Continue"**
10. Revisar y click **"Back to Dashboard"**

### Paso 3: Crear Credenciales OAuth

1. Menú lateral → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type**: `Web application`
4. **Name**: `Hidroaliaga Web App`
5. En **"Authorized redirect URIs"** click **"+ Add URI"**
6. Pegar URL exacta:
   ```
   https://hmwaoxbluljfqmsytyjv.supabase.co/auth/v1/callback
   ```
7. Click **"Create"**
8. **IMPORTANTE**: Guardar en lugar seguro:
   - **Client ID** (formato: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret**

### Paso 4: Configurar en Supabase

1. Ir a https://supabase.com/dashboard
2. Seleccionar proyecto
3. Menú lateral: **Authentication** → **Providers**
4. Buscar **Google** y hacer clic
5. **Desactivar** toggle **"Enable Signup"**
6. Completar campos:
   - **Client ID**: Pegar de Google Cloud
   - **Client Secret**: Pegar de Google Cloud
7. Click **"Save"**

### Paso 5: Verificar

1. Ir a aplicación en Vercel
2. Click "Acceder con Google"
3. Verificar que aparezca:
   ```
   Ir a Hidroaliaga
   ```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar OAuth consent screen
- [ ] Agregar test users
- [ ] Crear OAuth client ID
- [ ] Configurar redirect URI en Google
- [ ] Guardar Client ID y Client Secret
- [ ] Configurar credenciales en Supabase
- [ ] Desactivar "Enable Signup" en Supabase
- [ ] Probar login en aplicación
- [ ] Verificar mensaje muestra "Hidroaliaga"

---

## 🔗 ENLACES IMPORTANTES

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project ID**: hmwaoxbluljfqmsytyjv
- **Redirect URI**: `https://hmwaoxbluljfqmsytyjv.supabase.co/auth/v1/callback`

---

## ⚠️ NOTAS IMPORTANTES

1. **Es GRATIS**: Google Cloud Console tiene nivel gratuito
2. **Una sola vez**: Solo se configura una vez
3. **Seguridad**: Guardar Client Secret en lugar seguro (backend/.env)
4. **Test users**: Agregar emails de prueba antes de publicar

---

## 📞 SOPORTE

Si hay errores durante la configuración:
1. Verificar que el redirect URI esté exactamente igual
2. Confirmar que el proyecto de Google esté seleccionado
3. Revisar que el email esté en test users
4. Verificar que "Enable Signup" esté desactivado en Supabase

---

**Última actualización:** 2026-02-12
**Estado:** Documentado para implementación
**Prioridad:** ALTA
