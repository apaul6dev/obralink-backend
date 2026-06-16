import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivateCompanyHandler } from './application/command-handlers/company/activate-company.handler';
import { CreateCompanyAdminHandler } from './application/command-handlers/company/create-company-admin.handler';
import { CreateCompanyHandler } from './application/command-handlers/company/create-company.handler';
import { SuspendCompanyHandler } from './application/command-handlers/company/suspend-company.handler';
import { UpdateCompanyHandler } from './application/command-handlers/company/update-company.handler';
import { AssignRolesToUserHandler } from './application/command-handlers/user/assign-roles-to-user.handler';
import { CreateUserHandler } from './application/command-handlers/user/create-user.handler';
import { UpdateUserHandler } from './application/command-handlers/user/update-user.handler';
import { GetCompanyByIdHandler } from './application/query-handlers/company/get-company-by-id.handler';
import { GetCompaniesHandler } from './application/query-handlers/company/get-companies.handler';
import { GetUserByIdHandler } from './application/query-handlers/user/get-user-by-id.handler';
import { GetUsersByCompanyHandler } from './application/query-handlers/user/get-users-by-company.handler';
import { AppModuleAdminService } from './application/services/app-module-admin.service';
import { CompanyBranchAdminService } from './application/services/company-branch-admin.service';
import { MenuAdminService } from './application/services/menu-admin.service';
import { MenuQueryService } from './application/services/menu-query.service';
import { PermissionAdminService } from './application/services/permission-admin.service';
import { RoleAdminService } from './application/services/role-admin.service';
import { PERMISSION_REPOSITORY, ROLE_REPOSITORY, COMPANY_REPOSITORY, USER_REPOSITORY } from './domain/repositories/repository-tokens';
import { CompanyAccessPolicyService } from './domain/services/company-access-policy.service';
import { PermissionOrmEntity } from './infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { AppModuleOrmEntity } from './infrastructure/persistence/typeorm/entities/app-module.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/typeorm/entities/role.orm-entity';
import { RolePermissionOrmEntity } from './infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { CompanyBranchOrmEntity } from './infrastructure/persistence/typeorm/entities/company-branch.orm-entity';
import { CompanyOrmEntity } from './infrastructure/persistence/typeorm/entities/company.orm-entity';
import { MenuItemOrmEntity } from './infrastructure/persistence/typeorm/entities/menu-item.orm-entity';
import { MenuItemPermissionOrmEntity } from './infrastructure/persistence/typeorm/entities/menu-item-permission.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserRoleOrmEntity } from './infrastructure/persistence/typeorm/entities/user-role.orm-entity';
import { TypeOrmPermissionRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-permission.repository';
import { TypeOrmRoleRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-role.repository';
import { TypeOrmCompanyRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-company.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { AuthenticatedIdentityGuard } from './infrastructure/security/authenticated-identity.guard';
import { IdentityAuthSyncService } from './infrastructure/security/identity-auth-sync.service';
import { PermissionsGuard } from './infrastructure/security/permissions.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';
import { CompanyGuard } from './infrastructure/security/company.guard';
import { AppModulesController } from './presentation/controllers/app-modules.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { CompanyBranchesController } from './presentation/controllers/company-branches.controller';
import { CompaniesController } from './presentation/controllers/companies.controller';
import { MenuController } from './presentation/controllers/menu.controller';
import { UsersController } from './presentation/controllers/users.controller';

const commandHandlers = [
  CreateCompanyHandler,
  CreateCompanyAdminHandler,
  UpdateCompanyHandler,
  ActivateCompanyHandler,
  SuspendCompanyHandler,
  CreateUserHandler,
  UpdateUserHandler,
  AssignRolesToUserHandler,
];

const queryHandlers = [
  GetCompanyByIdHandler,
  GetCompaniesHandler,
  GetUserByIdHandler,
  GetUsersByCompanyHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      CompanyBranchOrmEntity,
      UserOrmEntity,
      RoleOrmEntity,
      AppModuleOrmEntity,
      PermissionOrmEntity,
      UserRoleOrmEntity,
      RolePermissionOrmEntity,
      MenuItemOrmEntity,
      MenuItemPermissionOrmEntity,
    ]),
  ],
  controllers: [CompaniesController, CompanyBranchesController, UsersController, RolesController, PermissionsController, AppModulesController, MenuController],
  providers: [
    CompanyAccessPolicyService,
    AppModuleAdminService,
    CompanyBranchAdminService,
    MenuAdminService,
    MenuQueryService,
    PermissionAdminService,
    RoleAdminService,
    AuthenticatedIdentityGuard,
    IdentityAuthSyncService,
    CompanyGuard,
    RolesGuard,
    PermissionsGuard,
    { provide: COMPANY_REPOSITORY, useClass: TypeOrmCompanyRepository },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: ROLE_REPOSITORY, useClass: TypeOrmRoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: TypeOrmPermissionRepository },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [COMPANY_REPOSITORY, USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY],
})
export class IdentityModule {}
