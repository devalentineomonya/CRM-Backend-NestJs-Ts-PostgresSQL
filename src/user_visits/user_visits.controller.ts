import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserVisitsService } from './user_visits.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('user-visits')
export class UserVisitsController {
  constructor(private readonly visitsService: UserVisitsService) {}

  @ApiBearerAuth()
  @Get('user/:userId')
  getUserVisits(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.visitsService.getUserVisits(userId, limit);
  }

  @ApiBearerAuth()
  @Get('user/:userId/count')
  getUserVisitsWithCount(@Param('userId') userId: string) {
    return this.visitsService.getUserVisitsWithCount(userId);
  }

  @ApiBearerAuth()
  @Get('recent')
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of past days',
  })
  getRecentVisits(@Query('days') days?: number) {
    return this.visitsService.getRecentVisits(days ?? 7);
  }

  @ApiBearerAuth()
  @Get('all')
  getAllVisits() {
    return this.visitsService.getAllVisits();
  }

  @ApiBearerAuth()
  @Get('counts-per-user')
  getVisitCountPerUser() {
    return this.visitsService.getVisitCountPerUser();
  }
}
