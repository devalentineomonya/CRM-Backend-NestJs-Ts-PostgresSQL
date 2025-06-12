import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { QuotesController } from './quotes.controller';
import { QuoteService } from './quotes.service';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/shared/mail/mail.service';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, User])],
  controllers: [QuotesController],
  providers: [QuoteService, MailService, PermissionHelper],
})
export class QuotesModule {}
