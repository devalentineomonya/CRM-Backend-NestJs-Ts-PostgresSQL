import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Patch,
  Req,
} from '@nestjs/common';
import { QuoteService } from './quotes.service';
import { Quote } from './entities/quote.entity';
import { CreateQuote } from './dto/create-quote.dto';
import { UpdateQuote } from './dto/update-quote.dto';
import { QuoteFilter } from './dto/filter-quote.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateQuoteStatusDto } from './dto/update-status.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';

@Roles(
  Role.FREE_USER,
  Role.PREMIUM_USER,
  Role.QUOTATIONS_ADMIN,
  Role.SUPER_ADMIN,
)
@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuoteService,
    private readonly permissionHelper: PermissionHelper,
  ) {}
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
  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<Quote[]> {
    this.permissionHelper.checkPermission(userId, req.user);
    return await this.quotesService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuote: UpdateQuote,
  ): Promise<Quote> {
    return this.quotesService.update(id, updateQuote);
  }

  @Roles(Role.QUOTATIONS_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, updateStatusDto);
  }

  @Roles(Role.QUOTATIONS_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.quotesService.remove(id);
  }
}
