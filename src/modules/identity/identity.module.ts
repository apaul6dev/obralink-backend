import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivateTenantHandler } from './application/command-handlers/tenant/activate-tenant.handler';
import { CreateTenantHandler } from './application/command-handlers/tenant/create-tenant.handler';
import { SuspendTenantHandler } from './application/command-handlers/tenant/suspend-tenant.handler';
import { UpdateTenantHandler } from './application/command-handlers/tenant/update-tenant.handler';
import { AssignRolesToUserHandler } from './application/command-handlers/user/assign-roles-to-user.handler';
import { CreateUserHandler } from './application/command-handlers/user/create-user.handler';
import { UpdateUserHandler } from './application/command-handlers/user/update-user.handler';
import { AssignRolesToActorHandler } from './application/command-handlers/actor/assign-roles-to-actor.handler';
import { CreateActorHandler } from './application/command-handlers/actor/create-actor.handler';
import { RemoveRolesFromActorHandler } from './application/command-handlers/actor/remove-roles-from-actor.handler';
import { UpdateActorHandler } from './application/command-handlers/actor/update-actor.handler';
import { GetActorsByRoleHandler } from './application/query-handlers/actor/get-actors-by-role.handler';
import { GetActorsByTenantHandler } from './application/query-handlers/actor/get-actors-by-tenant.handler';
import { GetTenantByIdHandler } from './application/query-handlers/tenant/get-tenant-by-id.handler';
import { GetTenantsHandler } from './application/query-handlers/tenant/get-tenants.handler';
import { GetUserByIdHandler } from './application/query-handlers/user/get-user-by-id.handler';
import { GetUsersByTenantHandler } from './application/query-handlers/user/get-users-by-tenant.handler';
import { ACTOR_REPOSITORY, PERMISSION_REPOSITORY, ROLE_REPOSITORY, TENANT_REPOSITORY, USER_REPOSITORY } from './domain/repositories/repository-tokens';
import { TenantAccessPolicyService } from './domain/services/tenant-access-policy.service';
import { ActorOrmEntity } from './infrastructure/persistence/typeorm/entities/actor.orm-entity';
import { ActorRoleOrmEntity } from './infrastructure/persistence/typeorm/entities/actor-role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/typeorm/entities/role.orm-entity';
import { RolePermissionOrmEntity } from './infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { TenantOrmEntity } from './infrastructure/persistence/typeorm/entities/tenant.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserRoleOrmEntity } from './infrastructure/persistence/typeorm/entities/user-role.orm-entity';
import { TypeOrmActorRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-actor.repository';
import { TypeOrmPermissionRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-permission.repository';
import { TypeOrmRoleRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-role.repository';
import { TypeOrmTenantRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-tenant.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { PermissionsGuard } from './infrastructure/security/permissions.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';
import { TenantGuard } from './infrastructure/security/tenant.guard';
import { ActorsController } from './presentation/controllers/actors.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { TenantsController } from './presentation/controllers/tenants.controller';
import { UsersController } from './presentation/controllers/users.controller';

const commandHandlers = [
  CreateTenantHandler,
  UpdateTenantHandler,
  ActivateTenantHandler,
  SuspendTenantHandler,
  CreateUserHandler,
  UpdateUserHandler,
  AssignRolesToUserHandler,
  CreateActorHandler,
  UpdateActorHandler,
  AssignRolesToActorHandler,
  RemoveRolesFromActorHandler,
];

const queryHandlers = [
  GetTenantByIdHandler,
  GetTenantsHandler,
  GetUserByIdHandler,
  GetUsersByTenantHandler,
  GetActorsByTenantHandler,
  GetActorsByRoleHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      TenantOrmEntity,
      UserOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity,
      UserRoleOrmEntity,
      RolePermissionOrmEntity,
      ActorOrmEntity,
      ActorRoleOrmEntity,
    ]),
  ],
  controllers: [TenantsController, UsersController, RolesController, ActorsController],
  providers: [
    TenantAccessPolicyService,
    TenantGuard,
    RolesGuard,
    PermissionsGuard,
    { provide: TENANT_REPOSITORY, useClass: TypeOrmTenantRepository },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: ROLE_REPOSITORY, useClass: TypeOrmRoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: TypeOrmPermissionRepository },
    { provide: ACTOR_REPOSITORY, useClass: TypeOrmActorRepository },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [TENANT_REPOSITORY, USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY, ACTOR_REPOSITORY],
})
export class IdentityModule {}
