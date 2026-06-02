import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SessionStatus } from '../../../../domain/enums/session-status.enum';

@Entity({ name: 'user_sessions' })
@Index('idx_user_sessions_user_status', ['userId', 'status'])
export class UserSessionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ type: 'enum', enum: SessionStatus, enumName: 'session_status_enum', default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ name: 'ip_address', type: 'varchar', length: 80, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ name: 'login_at', type: 'timestamptz' })
  loginAt: Date;

  @Column({ name: 'logout_at', type: 'timestamptz', nullable: true })
  logoutAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
