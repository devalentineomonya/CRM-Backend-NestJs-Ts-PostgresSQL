import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
@Entity({ name: 'user_visits' })
export class UserVisit {
  @PrimaryGeneratedColumn('uuid')
  visit_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  visit_time: Date;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ip_address: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  user_agent: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  device_type: string;

  @ManyToOne(() => User, (user) => user.visits)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
