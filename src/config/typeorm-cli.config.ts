import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import {
  Admin,
  AdminActivityLog,
  Profile,
  Quote,
  Ticket,
  User,
  UserVisit,
} from './index';
import { AddTrigramIndexesAndSearch1750097414766 } from 'src/migrations/1750097414766-AddTrigramIndexes';

config();
const configService = new ConfigService();
export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>('DATABASE_HOST'),
  port: configService.getOrThrow<number>('DATABASE_PORT'),
  username: configService.getOrThrow<string>('DATABASE_USER'),
  password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
  database: configService.getOrThrow<string>('DATABASE_DB'),
  ssl: configService.get<string>('NODE_ENV') !== 'development',
  logging: true,
  entities: [User, Admin, AdminActivityLog, Quote, Profile, UserVisit, Ticket],
  migrations: [AddTrigramIndexesAndSearch1750097414766],
});
