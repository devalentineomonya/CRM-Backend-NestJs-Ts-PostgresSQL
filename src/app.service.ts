import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  welcome(): { success: boolean; message: string } {
    return { success: true, message: 'Welcome to our CRM system' };
  }
}
