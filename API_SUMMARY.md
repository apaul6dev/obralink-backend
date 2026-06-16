# Resumen De API

Todas las rutas usan el prefijo global `/api`. Los endpoints privados de `identity` requieren cookie de sesion Better Auth.

Swagger/OpenAPI:

```text
GET /api/docs
```

Health check:

```text
GET /api/health
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

El login establece una cookie de sesion. La empresa activa para usuarios de empresa se toma de `ba_session.active_organization_id`; si no existe, el guard usa `users.company_id`.

El registro publico `/api/auth/sign-up/email` esta deshabilitado. Los usuarios se crean desde endpoints de `identity`.

## Sesion Esperada En Identity

`AuthenticatedIdentityGuard` transforma la sesion Better Auth a:

```json
{
  "id": "user-id",
  "userType": "SYSTEM_OWNER | COMPANY_ADMIN | BRANCH_ADMIN | COMPANY_USER",
  "companyId": "active-organization-id-or-domain-company-id-or-null",
  "branchId": "branch-id-or-null",
  "roles": ["company.admin"],
  "permissions": ["identity.users.read"]
}
```

## Identity - Companies

- `POST /api/identity/companies`: crea empresa. Requiere `SYSTEM_OWNER`.
- `GET /api/identity/companies`: lista empresas. Requiere `SYSTEM_OWNER`.
- `GET /api/identity/companies/:companyId`: obtiene empresa por id.
- `PATCH /api/identity/companies/:companyId`: actualiza empresa. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/companies/:companyId/activate`: activa empresa. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/companies/:companyId/suspend`: suspende empresa. Requiere `SYSTEM_OWNER`.
- `POST /api/identity/companies/:companyId/admin`: crea el administrador inicial de empresa. Requiere `SYSTEM_OWNER`.

## Identity - Company Branches

- `GET /api/identity/companies/:companyId/branches`: lista sucursales de empresa.
- `POST /api/identity/companies/:companyId/branches`: crea sucursal. Requiere `SYSTEM_OWNER` o `COMPANY_ADMIN`.
- `PATCH /api/identity/companies/:companyId/branches/:branchId`: actualiza sucursal. Requiere `SYSTEM_OWNER` o `COMPANY_ADMIN`.
- `DELETE /api/identity/companies/:companyId/branches/:branchId`: elimina sucursal con borrado logico. Requiere `SYSTEM_OWNER` o `COMPANY_ADMIN`.

## Identity - Users

- `POST /api/identity/users`: crea usuario interno. Requiere `COMPANY_ADMIN` o `BRANCH_ADMIN` y permiso `identity.users.create`.
- `GET /api/identity/users?companyId=`: lista usuarios por empresa. Requiere `SYSTEM_OWNER`, `COMPANY_ADMIN` o `BRANCH_ADMIN` y permiso `identity.users.read`.
- `GET /api/identity/users/:userId`: obtiene usuario por id. Requiere permiso `identity.users.read`.
- `PATCH /api/identity/users/:userId`: actualiza usuario. Requiere `SYSTEM_OWNER`, `COMPANY_ADMIN` o `BRANCH_ADMIN` y permiso `identity.users.update`.
- `POST /api/identity/users/:userId/roles`: asigna roles a un usuario. Requiere `COMPANY_ADMIN` o `BRANCH_ADMIN` y permiso `identity.users.roles.assign`.

## Identity - Roles

- `GET /api/identity/roles?companyId=`: lista roles por empresa. Requiere permiso `identity.roles.read`.
- `POST /api/identity/roles`: crea rol. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/roles/:roleId`: actualiza rol. Requiere `SYSTEM_OWNER`.
- `POST /api/identity/roles/:roleId/permissions`: asigna permisos al rol. Requiere `SYSTEM_OWNER`.
- `DELETE /api/identity/roles/:roleId`: elimina rol con borrado logico. Requiere `SYSTEM_OWNER`.

## Identity - Permissions

- `GET /api/identity/permissions`: lista permisos. Requiere `SYSTEM_OWNER`.
- `POST /api/identity/permissions`: crea permiso. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/permissions/:permissionId`: actualiza permiso. Requiere `SYSTEM_OWNER`.
- `DELETE /api/identity/permissions/:permissionId`: elimina permiso con borrado logico. Requiere `SYSTEM_OWNER`.

## Identity - Menu

- `GET /api/identity/menu`: obtiene menu autorizado para el usuario autenticado.
- `GET /api/identity/menu/admin`: lista items de menu para administracion. Requiere `SYSTEM_OWNER`.
- `POST /api/identity/menu/admin`: crea item de menu. Requiere `SYSTEM_OWNER`.
- `PATCH /api/identity/menu/admin/:menuItemId`: actualiza item de menu. Requiere `SYSTEM_OWNER`.
- `DELETE /api/identity/menu/admin/:menuItemId`: elimina item de menu con borrado logico. Requiere `SYSTEM_OWNER`.

## Procesos Implementados

- Autenticacion y cierre de sesion con Better Auth.
- Resolucion de identidad autenticada, empresa activa y sucursal.
- CRUD operativo de empresas, sucursales, roles, permisos y menu.
- Gestion de usuarios de empresa y sucursal.
- Asignacion de roles a usuarios.
- Asignacion de permisos a roles.
- Sincronizacion de permisos efectivos hacia `ba_user.permissions`.
- Consulta de menu filtrado por tipo de usuario y permisos.
- Seeds de empresa base, roles/permisos, menu y `SYSTEM_OWNER`.
- Migraciones para identity, Better Auth, menu, sucursales y `BRANCH_ADMIN`.
