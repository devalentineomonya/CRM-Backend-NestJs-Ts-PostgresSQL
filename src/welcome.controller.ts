import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorators';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class WelcomeController {
  constructor() {}

  @ApiTags('Welcome')
  @Public()
  @Get()
  getWelcome(): { success: boolean; message: string } {
    return {
      success: true,
      message: 'Welcome to our CRM system. API docs available at /api',
    };
  }
}
