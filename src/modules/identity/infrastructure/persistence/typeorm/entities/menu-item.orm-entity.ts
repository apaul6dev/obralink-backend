import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Status } from '../../../../domain/enums/status.enum';
import { UserType } from '../../../../domain/enums/user-type.enum';

@Entity({ name: 'menu_items' })
@Index('uq_menu_items_code_active', ['code'], { unique: true, where: 'deleted_at IS NULL' })
export class MenuItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  code: string;

  @Column({ name: 'title_key', type: 'varchar', length: 160 })
  titleKey: string;

  @Column({ name: 'router_link', type: 'varchar', length: 240, nullable: true })
  routerLink: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  href: string | null;

  @Column({ type: 'varchar', length: 80 })
  icon: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  target: string | null;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => MenuItemOrmEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuItemOrmEntity | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'allowed_user_types', type: 'enum', enum: UserType, array: true, nullable: true })
  allowedUserTypes: UserType[] | null;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
