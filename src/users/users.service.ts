import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { MailService } from 'src/shared/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { UpdateEmailDto } from './dto/update-user-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ActivateWithOtpDto } from './dto/activate-with-otp.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async findAll(
    filter: UserFilterDto,
  ): Promise<{ success: boolean; data: User[]; count: number }> {
    const { search, status, account_type, limit, page, sort_by, sort_order } =
      filter;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (status || account_type) {
      where = {
        ...(status && { status }),
        ...(account_type && { account_type }),
      };
    }

    if (search) {
      where = [
        { first_name: ILike(`%${search}%`), ...(where as object) },
        { last_name: ILike(`%${search}%`), ...(where as object) },
        { email: ILike(`%${search}%`), ...(where as object) },
      ];
    }

    const [data, count] = await this.userRepository.findAndCount({
      where,
      order: sort_by ? { [sort_by]: sort_order } : undefined,
      skip,
      take: limit,
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    data.forEach((user) => {
      user['profile_id'] = user.profile?.profile_id ?? null;
      user['quotes_count'] = user.quotes ? user.quotes.length : 0;
      user['tickets_count'] = user.tickets ? user.tickets.length : 0;
      user['visits_count'] = user.visits ? user.visits.length : 0;
    });

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<{ success: boolean; data: User }> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { success: true, data: user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return { success: true, data: savedUser };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = this.userRepository.merge(user.data, updateUserDto);
    const savedUser = await this.userRepository.save(updated);
    return { success: true, data: savedUser };
  }

  async updateAccountType(
    updateAccountTypeDto: UpdateAccountTypeDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, accountType } = updateAccountTypeDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.account_type = accountType;
    const updatedUser = await this.userRepository.save(user);

    return { success: true, data: updatedUser };
  }

  async updateEmail(
    userId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOneBy({ user_id: userId });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Check if new email is different
    if (user.email === updateEmailDto.email) {
      throw new BadRequestException(
        'New email must be different from current email',
      );
    }

    // Generate and save OTP
    const verificationCode = this.generateSecureOtp();
    const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);

    // Update user details
    user.email = updateEmailDto.email;
    user.hashed_email_verification_token = hashedVerificationToken;
    user.status = 'inactive';
    await this.userRepository.save(user);

    // Send verification email
    await this.sendOtpEmail(user.email, verificationCode, 'email-verification');

    return { success: true, message: 'Verification email sent successfully' };
  }

  async resendOtp(
    resendOtpDto: ResendOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { identifier, identifierType } = resendOtpDto;

    // Find user by email or user ID
    const where: FindOptionsWhere<User> = {};
    if (identifierType === 'email') {
      where.email = identifier;
    } else {
      where.user_id = identifier;
    }

    const user = await this.userRepository.findOne({ where });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow resend for inactive users
    if (user.status !== 'inactive') {
      throw new BadRequestException('User is already active');
    }

    // Generate new OTP
    const verificationCode = this.generateSecureOtp();
    const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);

    // Update token
    user.hashed_email_verification_token = hashedVerificationToken;
    await this.userRepository.save(user);

    // Determine context based on last action
    const context = user.account_type
      ? 'account-reactivation'
      : 'email-verification';

    // Resend email
    await this.sendOtpEmail(user.email, verificationCode, context);

    return { success: true, message: 'OTP resent successfully' };
  }

  async updateStatus(
    updateStatusDto: UpdateUserStatusDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, status } = updateStatusDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Handle activation
    if (status === 'active') {
      user.status = 'active';
      user.hashed_email_verification_token = null; // Clear OTP on activation
    }
    // Handle deactivation
    else if (status === 'inactive') {
      user.status = 'inactive';

      // Generate and send OTP only for new deactivations
      if (user.status !== 'inactive') {
        const verificationCode = this.generateSecureOtp();
        const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);
        user.hashed_email_verification_token = hashedVerificationToken;

        // Send reactivation OTP
        await this.sendOtpEmail(
          user.email,
          verificationCode,
          'account-reactivation',
        );
      }
    }

    const updatedUser = await this.userRepository.save(user);
    return { success: true, data: updatedUser };
  }

  async activateWithOtp(
    activateDto: ActivateWithOtpDto,
  ): Promise<{ success: boolean; data: User }> {
    const { identifier, identifierType, code, token } = activateDto;

    let user: User | null;

    // Find user by token if provided
    if (token) {
      user = await this.userRepository.findOne({
        where: { hashed_email_verification_token: token },
      });
    }
    // Find user by identifier (email or user ID)
    else {
      const where: FindOptionsWhere<User> = {};
      if (identifierType === 'email') {
        where.email = identifier;
      } else {
        where.user_id = identifier;
      }
      user = await this.userRepository.findOne({ where });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify using token
    if (token) {
      if (user.hashed_email_verification_token !== token) {
        throw new BadRequestException('Invalid verification token');
      }
    }
    // Verify using OTP code
    else if (code) {
      if (!user.hashed_email_verification_token) {
        throw new BadRequestException('No verification token found');
      }

      const isCodeValid = await bcrypt.compare(
        code,
        user.hashed_email_verification_token,
      );

      if (!isCodeValid) {
        throw new BadRequestException('Invalid OTP code');
      }
    } else {
      throw new BadRequestException('Either code or token must be provided');
    }

    // Activate user and clear token
    user.status = 'active';
    user.hashed_email_verification_token = null;
    const activatedUser = await this.userRepository.save(user);

    return { success: true, data: activatedUser };
  }

  private async sendOtpEmail(
    email: string,
    code: string,
    context: 'email-verification' | 'account-reactivation',
  ) {
    const emailProps = {
      otpCode: code,
      expiryMinutes: 10,
      supportEmail: 'support@example.com',
    };

    if (context === 'email-verification') {
      emailProps['verificationUrl'] =
        `https://example.com/verify-email?code=${code}`;
      await this.mailService.sendMfaCodeEmail(email, emailProps);
    } else {
      emailProps['reactivationUrl'] =
        `https://example.com/reactivate-account?code=${code}`;
      await this.mailService.sendMfaCodeEmail(email, emailProps);
    }
  }

  generateSecureOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    let lastDigit: string | null = null;

    while (otp.length < length) {
      const randomDigit = digits[Math.floor(Math.random() * 10)];

      if (randomDigit === lastDigit) {
        continue;
      }

      otp += randomDigit;
      lastDigit = randomDigit;
    }

    // Ensure not all digits are the same
    if (otp.split('').every((digit) => digit === otp[0])) {
      return this.generateSecureOtp(length);
    }

    return otp;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user.data);
    return { success: true };
  }
}
