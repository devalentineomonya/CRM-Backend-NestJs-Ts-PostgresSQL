import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { UserVisitsService } from 'src/user_visits/user_visits.service';
import { CreateUserVisitDto } from 'src/user_visits/dto/create-user_visit.dto';
import { UAParser } from 'ua-parser-js';
import { MailService } from 'src/shared/mail/mail.service';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userVisitsService: UserVisitsService,
    private readonly mailService: MailService,
  ) {}

  async signIn(
    createAuthDto: CreateAuthDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const { email, password, userType } = createAuthDto;
    console.log(ipAddress, userAgent);

    let entity: User | Admin | null = null;
    let repository: Repository<User> | Repository<Admin>;

    if (userType === 'user') {
      repository = this.userRepository;
      entity = await repository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })

        .getOne();
    } else if (userType === 'admin') {
      repository = this.adminRepository;
      entity = await repository
        .createQueryBuilder('admin')
        .addSelect('admin.password')
        .where('admin.email = :email', { email })
        .getOne();
    } else {
      throw new BadRequestException(
        'Invalid user type. Must be "user" or "admin"',
      );
    }

    if (!entity) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, entity.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userType === 'user') {
      if (entity instanceof User && entity.status === 'inactive') {
        throw new BadRequestException(
          'Your account is inactive. Kindly check your email for the activation link',
        );
      }

      await this.recordUserVisit(entity as User, ipAddress, userAgent);
    }

    const tokens = await this.generateTokens(entity, userType);
    await this.saveRefreshToken(userType, tokens.refreshToken, entity);

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
  async requestPasswordReset(requestResetPasswordDto: RequestResetPasswordDto) {
    const user = await this.userRepository.findOneBy({
      email: requestResetPasswordDto.email,
    });
    if (!user) throw new NotFoundException('User not found');
    console.log(user);
    const token = this.jwtService.sign(
      { sub: user.user_id, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '30m',
        ),
      },
    );

    await this.mailService.sendResetPasswordEmail(
      requestResetPasswordDto.email,
      token,
    );
    return {
      success: true,
      message:
        'Password reset sent successfully. Check your email for more instructions',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const payload: { sub: string; email: string } = this.jwtService.verify(
      resetPasswordDto.token,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      },
    );

    const user = await this.userRepository.findOne({
      where: { user_id: payload.sub },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    user.password = resetPasswordDto.newPassword;
    await this.userRepository.save(user);

    return { message: 'Password reset successful.' };
  }

  private async recordUserVisit(
    user: User,
    ip_address: string,
    user_agent: string,
  ) {
    const visitDto: CreateUserVisitDto = {
      ip_address,
      device_type: this.getDeviceType(user_agent).device_type,
      user_agent: this.getDeviceType(user_agent).user_agent,
    };

    await this.userVisitsService.createVisit(user, visitDto);
  }
  private getDeviceType(userAgent: string): {
    device_type: string;
    user_agent: string;
  } {
    const parsedResult = UAParser(userAgent);
    const { name: browserName = 'Unknown Browser' } =
      parsedResult.browser || {};

    const { name: osName = 'Unknown OS', version: osVersion = '' } =
      parsedResult.os || {};

    const {
      type: deviceTypeRaw = '',
      model: deviceModel = '',
      vendor: deviceVendor = '',
    } = parsedResult.device || {};

    const { architecture: cpuType = '' } = parsedResult.cpu || {};

    // Normalize OS and Device Type
    const normalizedOS = `${osName} ${osVersion}`.trim();
    let normalizedDeviceType = 'Unknown Device';

    if (osName?.toLowerCase().includes('android')) {
      if (deviceTypeRaw === 'smarttv') {
        normalizedDeviceType = 'Android TV';
      } else if (deviceTypeRaw === 'mobile' || deviceTypeRaw === 'tablet') {
        normalizedDeviceType = 'Android Phone';
      } else {
        normalizedDeviceType = 'Android Device';
      }
    } else if (osName?.toLowerCase().includes('windows')) {
      normalizedDeviceType = 'Windows PC';
    } else if (osName?.toLowerCase().includes('mac')) {
      normalizedDeviceType = 'Mac';
    } else if (deviceTypeRaw === 'console') {
      normalizedDeviceType = 'Console';
    } else if (deviceTypeRaw === 'xr') {
      normalizedDeviceType = 'Extended Reality Device';
    } else if (deviceTypeRaw === 'wearable') {
      normalizedDeviceType = 'Wearable';
    } else if (deviceTypeRaw === 'embedded' || !deviceTypeRaw) {
      normalizedDeviceType = 'Embedded Device';
    }

    // Clean vendor and model
    const vendor = deviceVendor ? deviceVendor : 'Unknown Vendor';
    const model = deviceModel ? deviceModel : '';

    const formattedUA = `${browserName} on a ${normalizedOS} ${normalizedDeviceType} from ${vendor} model ${model} with ${cpuType || 'Unknown'} CPU`;

    console.dir(parsedResult, { depth: null });
    return {
      device_type: normalizedDeviceType,
      user_agent: formattedUA,
    };
  }

  private getId(entity: User | Admin, userType: string): string {
    if (userType === 'user') {
      return (entity as User).user_id.toString();
    } else {
      return (entity as Admin).admin_id.toString();
    }
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private async saveRefreshToken(
    userType: 'admin' | 'user',
    refreshToken: string,
    entity: User | Admin,
  ) {
    const hashedToken = await this.hashToken(refreshToken);
    const updateData = {
      hashed_refresh_token: hashedToken,
      last_login: new Date(),
    };

    if (userType === 'admin') {
      await this.adminRepository.update(
        { admin_id: (entity as Admin).admin_id },
        updateData,
      );
    } else {
      await this.userRepository.update(
        { user_id: (entity as User).user_id },
        updateData,
      );
    }
  }

  private async generateTokens(entity: User | Admin, userType: string) {
    const payload = {
      sub: this.getId(entity, userType),
      email: entity.email,
      userType,
      role:
        userType === 'admin'
          ? (entity as Admin).role
          : (entity as User).account_type,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const payload: { sub: string; userType: string } = this.jwtService.verify(
      refreshToken,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    const { sub, userType } = payload;
    let entity: User | Admin | null = null;
    if (userType === 'user') {
      entity = await this.userRepository.findOneBy({
        user_id: sub,
      });
    } else if (userType === 'admin') {
      entity = await this.adminRepository.findOneBy({
        admin_id: sub,
      });
    } else {
      throw new BadRequestException('Invalid token');
    }
    if (!entity || !entity.hashed_refresh_token) {
      throw new UnauthorizedException('Invalid token');
    }
    const isTokenValid = await bcrypt.compare(
      refreshToken,
      entity.hashed_refresh_token,
    );
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const tokens = await this.generateTokens(entity, userType);
    await this.saveRefreshToken(userType, tokens.refreshToken, entity);
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async signOut(userId: string, userType: 'user' | 'admin') {
    if (userType === 'admin') {
      await this.adminRepository.update(userId, {
        hashed_refresh_token: null,
      });
    } else {
      await this.userRepository.update(userId, {
        hashed_refresh_token: null,
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }
}
