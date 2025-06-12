import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuote } from './dto/create-quote.dto';
import { UpdateQuote } from './dto/update-quote.dto';
import { QuoteFilter } from './dto/filter-quote.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateQuoteStatusDto } from './dto/update-status.dto';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async create(userId: string, createQuote: CreateQuote): Promise<Quote> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const quote = this.quoteRepository.create({
      ...createQuote,
      user,
    });

    return this.quoteRepository.save(quote);
  }

  async findAll(
    filter: QuoteFilter,
  ): Promise<{ success: boolean; data: Quote[]; count: number }> {
    const { search, status, user_id, limit, page, sort_by, sort_order } =
      filter;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const where: FindOptionsWhere<Quote> | FindOptionsWhere<Quote>[] = {};

    if (status) where.status = status;
    if (user_id) where.user = { user_id };

    if (search) {
      where.quote_details = ILike(`%${search}%`);
      where.quote_type = ILike(`%${search}%`);
    }

    const [data, count] = await this.quoteRepository.findAndCount({
      where,
      relations: ['user'],
      order: sort_by ? { [sort_by]: sort_order } : undefined,
      skip,
      take: limit,
    });

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { quote_id: id },
      relations: ['user'],
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }
    return quote;
  }

  async findByUserId(userId: string): Promise<Quote[]> {
    const quotes = await this.quoteRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });

    if (!quotes || quotes.length === 0) {
      throw new NotFoundException(`No quotes found for user with ID ${userId}`);
    }
    return quotes;
  }

  async update(id: string, updateQuote: UpdateQuote): Promise<Quote> {
    const quote = await this.findOne(id);
    const updated = this.quoteRepository.merge(quote, updateQuote);
    return this.quoteRepository.save(updated);
  }
  async updateStatus(
    id: string,
    updateStatusDto: UpdateQuoteStatusDto,
  ): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { quote_id: id },
      relations: ['user'],
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    if (quote.status === (updateStatusDto.status as typeof quote.status)) {
      throw new BadRequestException(
        `The quote is already in the status: ${updateStatusDto.status}`,
      );
    }

    quote.status = updateStatusDto.status;
    const updatedQuote = await this.quoteRepository.save(quote);

    const customerName = `${quote.user.first_name} ${quote.user.last_name}`;

    await this.mailService.sendQuotationStatusEmail(quote.user.email, {
      status: updateStatusDto.status,
      quoteNumber: quote.quote_id,
      projectName: quote.quote_details,
      customerName,
      estimatedCost: quote.estimated_cost.toString(),
      currency: `Kes`,
      validUntil: quote.valid_until,
      message: `Dear ${customerName}, your quote with ID ${quote.quote_id} has been updated to status: ${updateStatusDto.status}. Please review the details and contact us if you have any questions.`,
      dashboardUrl: 'https://localhost:3000/quotes',
    });

    return updatedQuote;
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findOne(id);
    await this.quoteRepository.remove(quote);
  }
}
