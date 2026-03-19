import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../database/entities/log.entity';
import * as https from 'https';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private logsService: LogsService,
  ) {}

  // Public registration is disabled - only admins can create accounts
  async register(_registerDto: RegisterDto) {
    throw new BadRequestException(
      'Self-registration is disabled. Please contact an administrator to create your account.',
    );
  }

  async googleLogin(idToken: string) {
    // Verify the Google ID token by calling Google's tokeninfo endpoint
    const googleUser = await this.verifyGoogleToken(idToken);

    if (!googleUser || !googleUser.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'No account found for this Google account. Please contact an administrator.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const token = this.generateToken(user);

    await this.logsService.createLog(
      LogAction.LOGIN,
      `User logged in via Google: ${user.email}`,
      user.id,
      JSON.stringify({ email: user.email, role: user.role, provider: 'google' }),
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; sub: string }> {
    return new Promise((resolve, reject) => {
      const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new UnauthorizedException('Invalid Google token: ' + parsed.error));
            } else {
              resolve({ email: parsed.email, name: parsed.name, sub: parsed.sub });
            }
          } catch {
            reject(new UnauthorizedException('Failed to parse Google token response'));
          }
        });
      }).on('error', (err) => reject(err));
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      // Log failed login attempt
      await this.logsService.createLog(
        LogAction.ERROR,
        `Failed login attempt: user not found`,
        undefined,
        JSON.stringify({ email: loginDto.email }),
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // Log failed login attempt
      await this.logsService.createLog(
        LogAction.ERROR,
        `Failed login attempt: invalid password`,
        user.id,
        JSON.stringify({ email: loginDto.email }),
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      // Log failed login attempt
      await this.logsService.createLog(
        LogAction.ERROR,
        `Failed login attempt: account deactivated`,
        user.id,
        JSON.stringify({ email: loginDto.email }),
      );
      throw new UnauthorizedException('Account is deactivated');
    }

    const token = this.generateToken(user);

    // Log successful login
    await this.logsService.createLog(
      LogAction.LOGIN,
      `User logged in: ${user.email}`,
      user.id,
      JSON.stringify({ email: user.email, role: user.role }),
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
