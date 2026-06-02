# Resumen De API

Todas las rutas usan el prefijo global `/api`. Los endpoints privados requieren Bearer JWT.

Swagger/OpenAPI:

```text
GET /api/docs
```

## Headers

Header opcional para correlación:

```http
x-tracking-id: 8b7a5a64-7df4-4f6d-a690-a8d0c1e89c7a
```

Si se envía, debe ser UUID. Si no se envía, el backend genera uno y lo devuelve en response headers.

## Auth

- `POST /api/auth/login`: inicia sesión. Público.
- `POST /api/auth/refresh-token`: rota refresh token y emite nuevo access token. Público.
- `POST /api/auth/logout`: revoca la sesión actual.
- `POST /api/auth/logout-all`: revoca todas las sesiones activas del usuario.
- `POST /api/auth/forgot-password`: solicita recuperación de contraseña. Público.
- `POST /api/auth/reset-password`: restablece contraseña con token. Público.
- `POST /api/auth/change-password`: cambia contraseña del usuario autenticado.
- `GET /api/auth/me`: devuelve el usuario autenticado.
- `GET /api/auth/sessions`: lista sesiones activas del usuario autenticado.

`login`, `refresh-token` y `me` devuelven un bloque `ui` para el frontend:

```json
{
  "ui": {
    "screens": ["dashboard", "users", "actors"],
    "actions": ["users.create", "actors.update"]
  }
}
```

## Identity - Tenants

- `POST /api/identity/tenants`: crea tenant. Requiere `GLOBAL_ADMIN`.
- `GET /api/identity/tenants`: lista tenants. Requiere `GLOBAL_ADMIN`.
- `GET /api/identity/tenants/:tenantId`: obtiene tenant por id.
- `PATCH /api/identity/tenants/:tenantId`: actualiza tenant. Requiere `GLOBAL_ADMIN`.
- `PATCH /api/identity/tenants/:tenantId/activate`: activa tenant. Requiere `GLOBAL_ADMIN`.
- `PATCH /api/identity/tenants/:tenantId/suspend`: suspende tenant. Requiere `GLOBAL_ADMIN`.

## Identity - Users

- `POST /api/identity/users`: crea usuario. Requiere `GLOBAL_ADMIN` o `TENANT_ADMIN` y permiso `identity.users.create`.
- `GET /api/identity/users?tenantId=`: lista usuarios por tenant. Usuarios tenant quedan restringidos al tenant del JWT.
- `GET /api/identity/users/:userId`: obtiene usuario por id.
- `PATCH /api/identity/users/:userId`: actualiza usuario.
- `POST /api/identity/users/:userId/roles`: asigna roles a un usuario tenant.

## Identity - Actors

- `POST /api/identity/actors`: crea actor de negocio en el tenant autenticado.
- `GET /api/identity/actors?tenantId=`: lista actores por tenant. Usuarios tenant quedan restringidos al tenant del JWT.
- `GET /api/identity/actors/by-role/:roleId?tenantId=`: lista actores por rol.
- `PATCH /api/identity/actors/:actorId`: actualiza actor.
- `POST /api/identity/actors/:actorId/roles`: asigna roles al actor.
- `POST /api/identity/actors/:actorId/roles/remove`: remueve roles del actor.

## Identity - Roles

- `GET /api/identity/roles?tenantId=`: lista roles por tenant. Usuarios tenant quedan restringidos al tenant del JWT.

## JWT

Payload esperado por guards y políticas:

```json
{
  "sub": "user-id",
  "email": "user@domain.com",
  "userType": "GLOBAL_ADMIN | TENANT_ADMIN | TENANT_USER",
  "tenantId": "tenant-id-or-null",
  "roles": ["role-code"],
  "permissions": ["identity.actors.read"],
  "sessionId": "session-id"
}
```
