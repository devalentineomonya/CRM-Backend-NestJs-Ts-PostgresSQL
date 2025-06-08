import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { QuoteService } from './quotes.service';
import { Quote } from './entities/quote.entity';
import { CreateQuote } from './dto/create-quote.dto';
import { UpdateQuote } from './dto/update-quote.dto';
import { QuoteFilter } from './dto/filter-quote.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuoteService) {}
  @ApiBearerAuth()
  @Post(':userId')
  create(
    @Body() createQuote: CreateQuote,
    @Param('userId') userId: string,
  ): Promise<Quote> {
    return this.quotesService.create(userId, createQuote);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Query() filter: QuoteFilter) {
    return this.quotesService.findAll(filter);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quote> {
    return this.quotesService.findOne(id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuote: UpdateQuote,
  ): Promise<Quote> {
    return this.quotesService.update(id, updateQuote);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.quotesService.remove(id);
  }
}
