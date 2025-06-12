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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketFilterDto } from './dto/filter-ticket.dto';
import { TicketStatusDto } from './dto/ticket-status.dto';
import { TicketPriorityDto } from './dto/priority.dto';
import { AssignAdminDto } from './dto/assign-to-admin.dto';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RequestWithUser } from 'src/shared/types/request.types';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @ApiBearerAuth()
  @Post(':userId')
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: Ticket,
  })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Param('userId') userId: string,
  ): Promise<Ticket> {
    return this.ticketsService.create(userId, createTicketDto);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all tickets with filtering' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  findAll(@Query() filter: TicketFilterDto) {
    return this.ticketsService.findAll(filter);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @ApiBearerAuth()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a ticket by User ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findByUserId(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<Ticket[]> {
    this.permissionHelper.checkPermission(userId, req.user);
    return this.ticketsService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status only' })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  updateTicketStatus(
    @Param('id') id: string,
    @Body() ticketStatusDto: TicketStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(
      id,
      req.user.admin_id ?? '',
      ticketStatusDto,
    );
  }

  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @Patch(':id/priority')
  @ApiOperation({ summary: 'Update ticket priority only' })
  @ApiResponse({
    status: 200,
    description: 'Ticket priority updated successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  updateTicketPriority(
    @Param('id') id: string,
    @Body() ticketPriorityDto: TicketPriorityDto,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketPriority(id, ticketPriorityDto);
  }

  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign admin to ticket' })
  @ApiResponse({
    status: 200,
    description: 'Admin assigned to ticket successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket or Admin not found' })
  assignAdminToTicket(
    @Param('id') id: string,
    @Body() assignAdminDto: AssignAdminDto,
  ): Promise<Ticket> {
    return this.ticketsService.assignAdminToTicket(id, assignAdminDto);
  }

  @Roles(Role.SUPER_ADMIN, Role.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
