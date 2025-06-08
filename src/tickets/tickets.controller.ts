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
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketFilterDto } from './dto/filter-ticket.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @ApiBearerAuth()
  @Post(':userId')
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Param('userId') userId: string,
  ): Promise<Ticket> {
    return this.ticketsService.create(userId, createTicketDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Query() filter: TicketFilterDto) {
    return this.ticketsService.findAll(filter);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
