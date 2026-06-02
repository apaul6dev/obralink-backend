import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TENANT_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { TenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { ActivateTenantCommand } from '../../commands/tenant/activate-tenant.command';

@CommandHandler(ActivateTenantCommand)
export class ActivateTenantHandler implements ICommandHandler<ActivateTenantCommand> {
  private readonly logger = new Logger(ActivateTenantHandler.name);

  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: ActivateTenantCommand): Promise<Tenant> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const tenant = await this.tenantRepository.findById(command.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    tenant.activate();
    const activatedTenant = await this.tenantRepository.save(tenant);
    this.logger.log(`Tenant activated tenantId=${activatedTenant.id} status=${activatedTenant.status}`);
    return activatedTenant;
  }
}
