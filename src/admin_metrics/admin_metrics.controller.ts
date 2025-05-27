import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminMetricsService } from './admin_metrics.service';
import { CreateAdminMetricDto } from './dto/create-admin_metric.dto';
import { UpdateAdminMetricDto } from './dto/update-admin_metric.dto';

@Controller('admin-metrics')
export class AdminMetricsController {
  constructor(private readonly adminMetricsService: AdminMetricsService) {}

  @Post()
  create(@Body() createAdminMetricDto: CreateAdminMetricDto) {
    return this.adminMetricsService.create(createAdminMetricDto);
  }

  @Get()
  findAll() {
    return this.adminMetricsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminMetricsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminMetricDto: UpdateAdminMetricDto,
  ) {
    return this.adminMetricsService.update(+id, updateAdminMetricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminMetricsService.remove(+id);
  }
}
