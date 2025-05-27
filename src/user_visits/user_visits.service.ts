import { Injectable } from '@nestjs/common';
import { CreateUserVisitDto } from './dto/create-user_visit.dto';
import { UpdateUserVisitDto } from './dto/update-user_visit.dto';

@Injectable()
export class UserVisitsService {
  create(createUserVisitDto: CreateUserVisitDto) {
    return 'This action adds a new userVisit';
  }

  findAll() {
    return `This action returns all userVisits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userVisit`;
  }

  update(id: number, updateUserVisitDto: UpdateUserVisitDto) {
    return `This action updates a #${id} userVisit`;
  }

  remove(id: number) {
    return `This action removes a #${id} userVisit`;
  }
}
