# Módulo Auth

Este módulo contiene la autenticación del backend multitenant.

## Responsabilidades

- Login multitenant.
- Emisión de access token JWT.
- Refresh token hasheado y rotativo.
- Logout de sesión actual.
- Logout de todos los dispositivos.
- Recuperación, reset y cambio de contraseña.
- Consulta del usuario autenticado.
- Consulta de sesiones activas.
- Validación de access token y sesión.
- Auditoría de eventos de autenticación.

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `GET /api/auth/sessions`

## Login Multitenant

- `GLOBAL_ADMIN` inicia sesión con email y contraseña.
- `TENANT_ADMIN` y `TENANT_USER` deben enviar `tenantId` o `companyIdentifier`.
- Usuarios suspendidos o tenants suspendidos no pueden iniciar sesión.
- El tenant no se toma desde headers.

## Sesiones Y Tokens

- Cada login crea un registro en `user_sessions`.
- Los refresh tokens se guardan hasheados en `refresh_tokens`.
- Cada refresh revoca el token anterior y guarda el nuevo token.
- Logout revoca refresh tokens activos de la sesión actual.
- Logout-all revoca todas las sesiones activas del usuario.

## Auditoría

Los eventos se registran en `auth_events`:

- `LOGIN`
- `FAILED_LOGIN`
- `LOGOUT`
- `LOGOUT_ALL_DEVICES`
- `PASSWORD_RESET_REQUESTED`
- `PASSWORD_RESET`
- `PASSWORD_CHANGED`
- `TOKEN_REFRESH`
