import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketFilterDto } from './dto/filter-ticket.dto';
import { TicketStatusDto } from './dto/ticket-status.dto';
import { TicketPriorityDto } from './dto/priority.dto';
import { AssignAdminDto } from './dto/assign-to-admin.dto';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { MailService } from 'src/shared/mail/mail.service';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private mailService: MailService,
    private permissionHelper: PermissionHelper,
  ) {}

  async create(
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<Ticket> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      user,
      assigned_admin: undefined,
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(
    filter: TicketFilterDto,
  ): Promise<{ success: boolean; data: Ticket[]; count: number }> {
    const {
      search,
      ticket_status,
      priority_level,
      user_id,
      assigned_to,
      limit,
      page,
      sort_by,
      sort_order,
    } = filter;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const take = limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.assigned_admin', 'admin');

    if (search) {
      queryBuilder.andWhere('ticket.issue ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (ticket_status) {
      queryBuilder.andWhere('ticket.ticket_status = :ticket_status', {
        ticket_status,
      });
    }

    if (priority_level) {
      queryBuilder.andWhere('ticket.priority_level = :priority_level', {
        priority_level,
      });
    }

    if (user_id) {
      queryBuilder.andWhere('user.user_id = :user_id', { user_id });
    }

    if (assigned_to) {
      queryBuilder.andWhere('admin.admin_id = :assigned_to', { assigned_to });
    }

    const order: 'ASC' | 'DESC' =
      sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sort_by) {
      if (sort_by === 'priority_level') {
        queryBuilder
          .addSelect(
            `
            CASE
              WHEN ticket.priority_level = 'high' THEN 1
              WHEN ticket.priority_level = 'medium' THEN 2
              WHEN ticket.priority_level = 'low' THEN 3
            END
          `,
            'priority_order',
          )
          .addOrderBy('priority_order', order);
      } else if (sort_by === 'ticket_status') {
        queryBuilder
          .addSelect(
            `
            CASE
              WHEN ticket.ticket_status = 'open' THEN 1
              WHEN ticket.ticket_status = 'in-progress' THEN 2
              WHEN ticket.ticket_status = 'closed' THEN 3
            END
          `,
            'status_order',
          )
          .addOrderBy('status_order', order);
      } else {
        const validColumns = [
          'ticket_id',
          'created_date',
          'resolved_date',
          'issue',
        ];
        if (validColumns.includes(sort_by)) {
          queryBuilder.addOrderBy(`ticket.${sort_by}`, order);
        } else {
          queryBuilder.addOrderBy('ticket.created_date', 'DESC');
        }
      }
    } else {
      queryBuilder.addOrderBy('ticket.created_date', 'DESC');
    }

    queryBuilder.skip(skip).take(take);

    const [data, count] = await queryBuilder.getManyAndCount();

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticket_id: id },
      relations: ['user', 'assigned_admin'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async findByUserId(userId: string): Promise<Ticket[]> {
    const ticket = await this.ticketRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'assigned_admin'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${userId} not found`);
    }
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    const updated = this.ticketRepository.merge(ticket, updateTicketDto);

    return this.ticketRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  async updateTicketStatus(
    id: string,
    currentAdmin: string,
    ticketStatusDto: TicketStatusDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    this.permissionHelper.checkPermission(ticket.assigned_admin.admin_id, {
      sub: currentAdmin,
    });
    const previousStatus = ticket.ticket_status;

    if (ticketStatusDto.ticket_status === previousStatus) {
      throw new BadRequestException(
        `Ticket is already in status: ${previousStatus}`,
      );
    }

    if (ticketStatusDto.ticket_status === 'closed' && !ticket.assigned_admin) {
      throw new BadRequestException(
        'Cannot close the ticket because no admin is assigned to it.',
      );
    }

    if (ticketStatusDto.ticket_status === 'closed') {
      ticket.resolved_date = new Date();
    } else if (ticket.resolved_date) {
      ticket.resolved_date = null;
    }

    ticket.ticket_status = ticketStatusDto.ticket_status;
    const updatedTicket = await this.ticketRepository.save(ticket);

    if (
      ticketStatusDto.ticket_status === 'closed' &&
      previousStatus !== 'closed'
    ) {
      await this.mailService.sendIssueAssignmentEmail(ticket.user.email, {
        issueId: ticket.ticket_id,
        issueTitle: ticket.issue,
        action: 'closed',
        dateString: ticket.created_date.toLocaleDateString(),
        closedBy: ticket.assigned_admin?.first_name || 'Admin',
        dashboardUrl: `https://localhost:3000/tickets/${ticket.ticket_id}`,
      });
    }

    return updatedTicket;
  }

  async updateTicketPriority(
    id: string,
    ticketPriorityDto: TicketPriorityDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    ticket.priority_level = ticketPriorityDto.priority_level;
    const updatedTicket = await this.ticketRepository.save(ticket);

    return updatedTicket;
  }

  async assignAdminToTicket(
    id: string,
    assignAdminDto: AssignAdminDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    const admin = await this.adminRepository.findOne({
      where: { admin_id: assignAdminDto.admin_id },
    });

    if (!admin) {
      throw new NotFoundException(
        `Admin with ID ${assignAdminDto.admin_id} not found`,
      );
    }

    ticket.assigned_admin = admin;
    const updatedTicket = await this.ticketRepository.save(ticket);

    await this.mailService.sendIssueAssignmentEmail(admin.email, {
      issueId: ticket.ticket_id,
      issueTitle: ticket.issue,
      action: 'assigned',
      userName: `${ticket.user.first_name} ${ticket.user.last_name}`,
      dateString: ticket.created_date.toLocaleDateString(),
      assignedTo: `${admin.first_name} ${admin.last_name}`,
      dashboardUrl: `http://localhost:3000/tickets/${ticket.ticket_id}`,
    });

    return updatedTicket;
  }
}
