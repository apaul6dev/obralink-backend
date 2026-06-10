import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Status } from '../../../domain/enums/status.enum';
import { UserType } from '../../../domain/enums/user-type.enum';
import { COMPANY_REPOSITORY, USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { IdentityAuthSyncService } from '../../../infrastructure/security/identity-auth-sync.service';
import { CreateCompanyAdminCommand } from '../../commands/company/create-company-admin.command';

@CommandHandler(CreateCompanyAdminCommand)
export class CreateCompanyAdminHandler implements ICommandHandler<CreateCompanyAdminCommand> {
  private readonly logger = new Logger(CreateCompanyAdminHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
    private readonly identityAuthSync: IdentityAuthSyncService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateCompanyAdminCommand): Promise<User> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const company = await this.companyRepository.findById(command.companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const now = new Date();
    const user = await this.userRepository.save(
      new User(
        randomUUID(),
        company.id,
        command.payload.email.toLowerCase(),
        command.payload.firstName,
        command.payload.lastName,
        UserType.COMPANY_ADMIN,
        Status.ACTIVE,
        command.payload.identificationNumber ?? null,
        command.payload.personalEmail?.toLowerCase() ?? null,
        command.payload.phoneNumber ?? null,
        now,
        now,
      ),
    );

    const permissions = await this.assignCompanyAdminRole(user.id, company.id);
    await this.identityAuthSync.provisionUser({
      id: user.id,
      email: user.email,
      password: command.payload.password,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      companyId: user.companyId,
      permissions,
    });

    this.logger.log(`Company admin created userId=${user.id} companyId=${company.id}`);
    return user;
  }

  private async assignCompanyAdminRole(userId: string, companyId: string): Promise<string[]> {
    const roles = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM roles
        WHERE company_id = $1
          AND code = 'company.admin'
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [companyId],
    );

    if (roles.length === 0) {
      return [];
    }

    await this.dataSource.query(
      `
        INSERT INTO user_roles (user_id, role_id, company_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, role_id, company_id) DO NOTHING
      `,
      [userId, roles[0].id, companyId],
    );

    const permissions = await this.dataSource.query<Array<{ code: string }>>(
      `
        SELECT DISTINCT permission.code AS code
        FROM role_permissions role_permission
        INNER JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
        WHERE role_permission.role_id = $1
        ORDER BY permission.code
      `,
      [roles[0].id],
    );

    return permissions.map((permission) => permission.code);
  }
}
