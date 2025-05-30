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
  @PrimaryGeneratedColumn()
  visit_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  visit_time: Date;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ip_address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_type: string;

  // Relationship
  @ManyToOne(() => User, (user) => user.visits)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
