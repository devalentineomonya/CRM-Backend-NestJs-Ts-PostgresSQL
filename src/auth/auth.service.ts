import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userVisitsService: UserVisitsService,
  ) {}

  async signIn(
    createAuthDto: CreateAuthDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const { email, password, userType } = createAuthDto;

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

  private async recordUserVisit(
    user: User,
    ipAddress: string,
    userAgent: string,
  ) {
    const visitDto: CreateUserVisitDto = {
      ipAddress,
      deviceType: this.getDeviceType(userAgent),
      userAgent,
    };

    try {
      await this.userVisitsService.createVisit(user, visitDto);
    } catch (visitError) {
      console.error('Failed to record user visit:', visitError);
    }
  }

  private getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    return 'Desktop';
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
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
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
