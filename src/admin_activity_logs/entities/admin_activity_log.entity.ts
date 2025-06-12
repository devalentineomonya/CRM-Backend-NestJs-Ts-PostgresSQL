import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';

@Entity({ name: 'admin_activity_logs' })
export class AdminActivityLog {
  @PrimaryGeneratedColumn('uuid')
  log_id: string;

  @Column({ type: 'varchar', length: 100 })
  action_type: string;

  @Column({ type: 'text', nullable: true })
  action_details: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  action_time: Date;

  @Column({ type: 'varchar', length: 50 })
  ip_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  target_entity: string;

  @Column({ type: 'int', nullable: true })
  target_id: number;

  @ManyToOne(() => Admin, (admin) => admin.activity_logs)
  admin: Admin;
}
