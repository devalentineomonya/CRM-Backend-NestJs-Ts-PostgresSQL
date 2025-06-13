import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorators';

@UseInterceptors(CacheInterceptor)
@Controller('test')
export class TestController {
  @Public()
  @Get()
  @CacheKey('test-key')
  @CacheTTL(30)
  getTest() {
    console.log('Called getTest, not from cache');
    return { timestamp: new Date().toISOString() };
  }
}
