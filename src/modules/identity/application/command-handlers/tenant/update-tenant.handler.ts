import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TENANT_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { TenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { UpdateTenantCommand } from '../../commands/tenant/update-tenant.command';
import { Tenant } from '../../../domain/entities/tenant.entity';

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler implements ICommandHandler<UpdateTenantCommand> {
  private readonly logger = new Logger(UpdateTenantHandler.name);

  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<Tenant> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const tenant = await this.tenantRepository.findById(command.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    tenant.name = command.payload.name ?? tenant.name;
    tenant.legalName = command.payload.legalName ?? tenant.legalName;
    tenant.identificationNumber = command.payload.identificationNumber ?? tenant.identificationNumber;
    const updatedTenant = await this.tenantRepository.save(tenant);
    this.logger.log(`Tenant updated tenantId=${updatedTenant.id} status=${updatedTenant.status}`);
    return updatedTenant;
  }
}
