import { Quote } from './../../quotes/entities/quote.entity';
import { Profile } from './../../profiles/entities/profile.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'users' })
export class User {
  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  last_name: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_picture: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Index()
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'varchar', enum: ['free', 'premium'], default: 'free' })
  account_type: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  hashed_refresh_token: string | null;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Quote, (quote) => quote.user)
  quotes: Quote[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => UserVisit, (visit) => visit.user)
  visits: UserVisit[];
}
