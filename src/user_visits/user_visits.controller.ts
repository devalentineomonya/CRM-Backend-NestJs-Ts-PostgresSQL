import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserVisitsService } from './user_visits.service';
import { CreateUserVisitDto } from './dto/create-user_visit.dto';
import { UpdateUserVisitDto } from './dto/update-user_visit.dto';

@Controller('user-visits')
export class UserVisitsController {
  constructor(private readonly userVisitsService: UserVisitsService) {}

  @Post()
  create(@Body() createUserVisitDto: CreateUserVisitDto) {
    return this.userVisitsService.create(createUserVisitDto);
  }

  @Get()
  findAll() {
    return this.userVisitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userVisitsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserVisitDto: UpdateUserVisitDto,
  ) {
    return this.userVisitsService.update(+id, updateUserVisitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userVisitsService.remove(+id);
  }
}
