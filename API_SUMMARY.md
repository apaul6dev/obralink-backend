# Resumen De API

Todas las rutas usan el prefijo global `/api`. Los endpoints privados de `identity` requieren cookie de sesion Better Auth.

Swagger/OpenAPI:

```text
GET /api/docs
```

## Headers

Header opcional para correlacion:

```http
x-tracking-id: 8b7a5a64-7df4-4f6d-a690-a8d0c1e89c7a
```

Si se envia, debe ser UUID. Si no se envia, el backend genera uno y lo devuelve en response headers.

## Auth

La autenticacion la maneja Better Auth bajo `/api/auth/*`.

Endpoint comun de login email/password:

```text
POST /api/auth/sign-in/email
```

El login establece una cookie de sesion. La empresa activa para usuarios de empresa se toma de `ba_session.active_organization_id`.

El registro público `/api/auth/sign-up/email` está deshabilitado. Los usuarios se crean desde `POST /api/identity/users`.

## Identity - Companies

- `POST /api/identity/companies`: crea empresa. Requiere `SYSTEM_OWNER`.
- `GET /api/identity/companies`: lista empresas. Requiere `SYSTEM_OWNER`.
- `GET /api/identity/companies/:companyId`: obtiene empresa por id.
- `PATCH /api/identity/companies/:companyId`: actualiza empresa. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/companies/:companyId/activate`: activa empresa. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/companies/:companyId/suspend`: suspende empresa. Requiere `SYSTEM_OWNER`.

## Identity - Users

- `POST /api/identity/companies/:companyId/admin`: crea el administrador inicial de empresa. Requiere `SYSTEM_OWNER`.
- `POST /api/identity/users`: crea usuario interno. Requiere `COMPANY_ADMIN`.
- `GET /api/identity/users?companyId=`: lista usuarios por empresa.
- `GET /api/identity/users/:userId`: obtiene usuario por id.
- `PATCH /api/identity/users/:userId`: actualiza usuario.
- `POST /api/identity/users/:userId/roles`: asigna roles a un usuario.

## Identity - Roles

- `GET /api/identity/roles?companyId=`: lista roles por empresa.

## Sesion Esperada En Identity

`AuthenticatedIdentityGuard` transforma la sesion Better Auth a:

```json
{
  "id": "user-id",
  "userType": "SYSTEM_OWNER | COMPANY_ADMIN | COMPANY_USER",
  "companyId": "active-organization-id-or-null",
  "roles": ["company.admin"],
  "permissions": ["identity.users.read"]
}
```
