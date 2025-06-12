import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Ip,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorators';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @Public()
  @Post('signin')
  signIn(
    @Body() createAuthDto: CreateAuthDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : 'UNKNOWN';

    return this.authService.signIn(createAuthDto, ipAddress, userAgent);
  }

  @Public()
  @Post('request-reset-password')
  requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ) {
    return this.authService.requestPasswordReset(requestResetPasswordDto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete('signout/:id')
  signOut(@Param('id') id: string, @Req() req: RequestWithUser) {
    this.permissionHelper.checkPermission(id, req.user);
    return this.authService.signOut(id, req.user.userType as 'admin' | 'user');
  }
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh/:id')
  refreshToken(@Param('id') id: string, @Req() req: RequestWithUser) {
    this.permissionHelper.checkPermission(id, req.user);
    return this.authService.refreshToken(id);
  }
}
