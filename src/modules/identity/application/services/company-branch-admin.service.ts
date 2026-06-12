import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateCompanyBranchDto } from '../dto/company-branch/create-company-branch.dto';
import { UpdateCompanyBranchDto } from '../dto/company-branch/update-company-branch.dto';
import { Status } from '../../domain/enums/status.enum';
import { AuthenticatedIdentity, CompanyAccessPolicyService } from '../../domain/services/company-access-policy.service';
import { CompanyBranchOrmEntity } from '../../infrastructure/persistence/typeorm/entities/company-branch.orm-entity';

@Injectable()
export class CompanyBranchAdminService {
  constructor(
    @InjectRepository(CompanyBranchOrmEntity)
    private readonly branchRepository: Repository<CompanyBranchOrmEntity>,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async findByCompany(currentUser: AuthenticatedIdentity, companyId: string): Promise<CompanyBranchOrmEntity[]> {
    this.accessPolicy.assertCompanyAccess(currentUser, companyId);
    const branchId = this.accessPolicy.resolveBranchIdForCompanyRead(currentUser);
    return this.branchRepository.find({
      where: branchId ? { companyId, id: branchId } : { companyId },
      order: { name: 'ASC' },
    });
  }

  async create(currentUser: AuthenticatedIdentity, companyId: string, payload: CreateCompanyBranchDto): Promise<CompanyBranchOrmEntity> {
    this.accessPolicy.assertCompanyAccess(currentUser, companyId);
    await this.assertCodeAvailable(companyId, payload.code);
    return this.branchRepository.save(
      this.branchRepository.create({
        id: randomUUID(),
        companyId,
        name: payload.name.trim(),
        code: payload.code.trim(),
        address: payload.address?.trim() || null,
        city: payload.city?.trim() || null,
        state: payload.state?.trim() || null,
        phone: payload.phone?.trim() || null,
        email: payload.email?.toLowerCase().trim() || null,
        status: payload.status ?? Status.ACTIVE,
      }),
    );
  }

  async update(currentUser: AuthenticatedIdentity, companyId: string, branchId: string, payload: UpdateCompanyBranchDto): Promise<CompanyBranchOrmEntity> {
    this.accessPolicy.assertCompanyAccess(currentUser, companyId);
    const branch = await this.findExisting(companyId, branchId);
    if (payload.code && payload.code.trim() !== branch.code) {
      await this.assertCodeAvailable(companyId, payload.code, branchId);
      branch.code = payload.code.trim();
    }
    branch.name = payload.name?.trim() ?? branch.name;
    branch.address = payload.address !== undefined ? payload.address?.trim() || null : branch.address;
    branch.city = payload.city !== undefined ? payload.city?.trim() || null : branch.city;
    branch.state = payload.state !== undefined ? payload.state?.trim() || null : branch.state;
    branch.phone = payload.phone !== undefined ? payload.phone?.trim() || null : branch.phone;
    branch.email = payload.email !== undefined ? payload.email?.toLowerCase().trim() || null : branch.email;
    branch.status = payload.status ?? branch.status;
    return this.branchRepository.save(branch);
  }

  async remove(currentUser: AuthenticatedIdentity, companyId: string, branchId: string): Promise<void> {
    this.accessPolicy.assertCompanyAccess(currentUser, companyId);
    const branch = await this.findExisting(companyId, branchId);
    await this.branchRepository.softRemove(branch);
  }

  private async findExisting(companyId: string, branchId: string): Promise<CompanyBranchOrmEntity> {
    const branch = await this.branchRepository.findOne({ where: { id: branchId, companyId } });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }
    return branch;
  }

  private async assertCodeAvailable(companyId: string, code: string, excludeId?: string): Promise<void> {
    const branch = await this.branchRepository.findOne({ where: { companyId, code: code.trim() } });
    if (branch && branch.id !== excludeId) {
      throw new ConflictException('Branch code already exists in this company.');
    }
  }
}
