import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Status } from '../../../../domain/enums/status.enum';
import { UserType } from '../../../../domain/enums/user-type.enum';
import { TenantOrmEntity } from './tenant.orm-entity';

@Entity({ name: 'users' })
@Index('uq_users_tenant_email_active', ['tenantId', 'email'], { unique: true, where: 'deleted_at IS NULL' })
@Index('uq_users_tenant_identification_active', ['tenantId', 'identificationNumber'], { unique: true, where: 'deleted_at IS NULL AND identification_number IS NOT NULL' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @ManyToOne(() => TenantOrmEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantOrmEntity | null;

  @Column({ type: 'varchar', length: 180 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
