import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'quote_requests' })
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  quote_id: string;

  @ManyToOne(() => User, (user) => user.quotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  @Index({ fulltext: true })
  quote_details: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ name: 'requested_date' })
  @Index()
  requested_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  valid_until: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  quote_type: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[];
}
