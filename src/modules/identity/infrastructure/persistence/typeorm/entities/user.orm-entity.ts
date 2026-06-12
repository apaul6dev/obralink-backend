import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Status } from '../../../../domain/enums/status.enum';
import { UserType } from '../../../../domain/enums/user-type.enum';
import { CompanyBranchOrmEntity } from './company-branch.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';

@Entity({ name: 'users' })
@Index('uq_users_company_email_active', ['companyId', 'email'], { unique: true, where: 'deleted_at IS NULL' })
@Index('uq_users_company_identification_active', ['companyId', 'identificationNumber'], { unique: true, where: 'deleted_at IS NULL AND identification_number IS NOT NULL' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @ManyToOne(() => CompanyOrmEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: CompanyOrmEntity | null;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => CompanyBranchOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: CompanyBranchOrmEntity | null;

  @Column({ type: 'varchar', length: 180 })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'user_type', type: 'enum', enum: UserType, enumName: 'user_type_enum' })
  userType: UserType;

  @Column({ type: 'enum', enum: Status, enumName: 'status_enum', default: Status.ACTIVE })
  status: Status;

  @Column({ name: 'identification_number', type: 'varchar', length: 60, nullable: true })
  identificationNumber: string | null;

  @Column({ name: 'personal_email', type: 'varchar', length: 180, nullable: true })
  personalEmail: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 40, nullable: true })
  phoneNumber: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
