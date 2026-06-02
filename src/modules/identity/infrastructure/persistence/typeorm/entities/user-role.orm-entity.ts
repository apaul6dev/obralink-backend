import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { TenantOrmEntity } from './tenant.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity({ name: 'user_roles' })
@Index('uq_user_roles_user_role_tenant', ['userId', 'roleId', 'tenantId'], { unique: true })
export class UserRoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserOrmEntity;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleOrmEntity;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
