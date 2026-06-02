import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ActorOrmEntity } from './actor.orm-entity';
import { RoleOrmEntity } from './role.orm-entity';
import { TenantOrmEntity } from './tenant.orm-entity';

@Entity({ name: 'actor_roles' })
@Index('uq_actor_roles_actor_role_tenant', ['actorId', 'roleId', 'tenantId'], { unique: true })
export class ActorRoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @ManyToOne(() => ActorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor?: ActorOrmEntity;

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
