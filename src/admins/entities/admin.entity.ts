import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { AdminActivityLog } from 'src/admin_activity_logs/entities/admin_activity_log.entity';

@Entity({ name: 'admins' })
export class Admin {
  @PrimaryGeneratedColumn()
  admin_id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'support' })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  // Relationships
  @OneToMany(() => Ticket, (ticket) => ticket.assigned_admin)
  tickets: Ticket[];

  @OneToMany(() => AdminActivityLog, (log) => log.admin)
  activity_logs: AdminActivityLog[];
}
