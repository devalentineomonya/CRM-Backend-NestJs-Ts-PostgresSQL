import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { AdminActivityLog } from 'src/admin_activity_logs/entities/admin_activity_log.entity';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'admins' })
export class Admin {
  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  admin_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'support' })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_refresh_token: string | null;

  @OneToMany(() => Ticket, (ticket) => ticket.assigned_admin)
  tickets: Ticket[];

  @OneToMany(() => AdminActivityLog, (log) => log.admin)
  activity_logs: AdminActivityLog[];
}
