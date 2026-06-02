import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TENANT_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { TenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { SuspendTenantCommand } from '../../commands/tenant/suspend-tenant.command';

@CommandHandler(SuspendTenantCommand)
export class SuspendTenantHandler implements ICommandHandler<SuspendTenantCommand> {
  private readonly logger = new Logger(SuspendTenantHandler.name);

  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: SuspendTenantCommand): Promise<Tenant> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const tenant = await this.tenantRepository.findById(command.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    tenant.suspend();
    const suspendedTenant = await this.tenantRepository.save(tenant);
    this.logger.log(`Tenant suspended tenantId=${suspendedTenant.id} status=${suspendedTenant.status}`);
    return suspendedTenant;
  }
}
