import { Company } from '../../domain/entities/company.entity';

export class CompanyPresenter {
  static toHttp(company: Company) {
    return company;
  }
}
