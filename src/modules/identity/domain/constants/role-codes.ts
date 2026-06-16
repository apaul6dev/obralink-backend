export const RoleCode = {
  CompanyAdmin: 'company.admin',
  CompanyUser: 'company.user',
  BranchAdmin: 'branch.admin',
  SalesRepresentative: 'sales.representative',
  EngineerTechnician: 'engineer.technician',
  AccountingFinance: 'accounting.finance',
  Management: 'management',
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];
