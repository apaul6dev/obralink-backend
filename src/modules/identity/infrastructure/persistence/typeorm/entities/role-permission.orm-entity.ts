import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';
import { RoleOrmEntity } from './role.orm-entity';

@Entity({ name: 'role_permissions' })
@Index('uq_role_permissions_role_permission_tenant', ['roleId', 'permissionId', 'tenantId'], { unique: true })
export class RolePermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleOrmEntity;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => PermissionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission?: PermissionOrmEntity;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
