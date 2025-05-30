import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from 'src/admins/entities/admin.entity';

@Entity({ name: 'admin_activity_logs' })
export class AdminActivityLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  action_type: string;

  @Column({ type: 'text', nullable: true })
  action_details: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  action_time: Date;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ip_address: string;

  // Relationship
  @ManyToOne(() => Admin, (admin) => admin.activity_logs)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}
