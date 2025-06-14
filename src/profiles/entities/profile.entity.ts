import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'user_profiles' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  profile_id: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zip_code: string;

  @Column({
    type: 'enum',
    enum: ['en', 'es', 'fr', 'de', 'sw', 'other'],
    default: 'en',
  })
  preferred_language: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;
  @Column({ type: 'simple-array', nullable: true })
  social_media_links: string[];

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
