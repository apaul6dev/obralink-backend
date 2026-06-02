import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ActorType } from '../../../../domain/enums/actor-type.enum';
import { Status } from '../../../../domain/enums/status.enum';
import { TenantOrmEntity } from './tenant.orm-entity';

@Entity({ name: 'actors' })
@Index('uq_actors_tenant_email_active', ['tenantId', 'email'], { unique: true, where: 'deleted_at IS NULL AND email IS NOT NULL' })
@Index('uq_actors_tenant_identification_active', ['tenantId', 'identificationNumber'], { unique: true, where: 'deleted_at IS NULL AND identification_number IS NOT NULL' })
export class ActorOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantOrmEntity;

  @Column({ type: 'enum', enum: ActorType, enumName: 'actor_type_enum' })
  type: ActorType;

  @Column({ type: 'varchar', length: 180 })
  name: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email: string | null;

  @Column({ name: 'identification_number', type: 'varchar', length: 60, nullable: true })
  identificationNumber: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: Status, enumName: 'status_enum', default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
