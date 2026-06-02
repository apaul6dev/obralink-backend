import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { Status } from '../../../domain/enums/status.enum';
import { TENANT_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { TenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { CreateTenantCommand } from '../../commands/tenant/create-tenant.command';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  private readonly logger = new Logger(CreateTenantHandler.name);

  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: CreateTenantCommand): Promise<Tenant> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const now = new Date();
    const tenant = await this.tenantRepository.save(
      new Tenant(randomUUID(), command.payload.name, command.payload.legalName ?? null, command.payload.identificationNumber ?? null, Status.INACTIVE, now, now),
    );
    this.logger.log(`Tenant created tenantId=${tenant.id} status=${tenant.status}`);
    return tenant;
  }
}
