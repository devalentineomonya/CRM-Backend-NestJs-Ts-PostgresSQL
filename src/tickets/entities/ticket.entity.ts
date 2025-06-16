import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  ticket_id: string;

  @Column({ type: 'text', nullable: false })
  issue: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ['open', 'in-progress', 'closed'],
    default: 'open',
  })
  ticket_status: string;

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  resolved_date: Date | null;

  @Index()
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority_level: string;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Admin, (admin) => admin.tickets)
  @JoinColumn({ name: 'assigned_to' })
  assigned_admin: Admin;
}
