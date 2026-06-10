import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../../../domain/entities/company.entity';
import { CompanyRepository } from '../../../../domain/repositories/company.repository.interface';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { CompanyMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmCompanyRepository implements CompanyRepository {
  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly repository: Repository<CompanyOrmEntity>,
  ) {}

  async save(company: Company): Promise<Company> {
    const saved = await this.repository.save(CompanyMapper.toOrm(company));
    return CompanyMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.repository.findOne({ where: { id } });
    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findAll(): Promise<Company[]> {
    const companies = await this.repository.find({ order: { createdAt: 'DESC' } });
    return companies.map(CompanyMapper.toDomain);
  }
}
