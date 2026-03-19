import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../database/entities/log.entity';

export class InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  temporaryPassword?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logsService: LogsService,
  ) {}

  async inviteUser(
    inviteDto: InviteUserDto,
    adminId: string,
  ): Promise<{ user: User; temporaryPassword: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: inviteDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role
    const allowedRoles = [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST];
    if (!allowedRoles.includes(inviteDto.role)) {
      throw new BadRequestException(
        `Only ${allowedRoles.join(', ')} can be invited`,
      );
    }

    // Generate temporary password
    const temporaryPassword =
      inviteDto.temporaryPassword || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create user
    const user = this.userRepository.create({
      email: inviteDto.email,
      firstName: inviteDto.firstName,
      lastName: inviteDto.lastName,
      phone: inviteDto.phone,
      password: hashedPassword,
      role: inviteDto.role,
      isActive: true,
    });

    await this.userRepository.save(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.INVITE_USER,
      `Admin invited ${inviteDto.role}: ${inviteDto.email}`,
      adminId,
      JSON.stringify({
        invitedUserId: user.id,
        invitedEmail: user.email,
        invitedRole: user.role,
      }),
    );

    return {
      user,
      temporaryPassword,
    };
  }

  async createUser(
    createUserDto: InviteUserDto,
    adminId: string,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role
    const allowedRoles = [UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST];
    if (!allowedRoles.includes(createUserDto.role)) {
      throw new BadRequestException(
        `Only ${allowedRoles.join(', ')} can be created`,
      );
    }

    // Use provided password or generate temporary one
    const password =
      createUserDto.temporaryPassword || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      password: hashedPassword,
      role: createUserDto.role,
      isActive: true,
    });

    await this.userRepository.save(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.CREATE_USER,
      `Admin created user: ${createUserDto.email}`,
      adminId,
      JSON.stringify({
        createdUserId: user.id,
        createdEmail: user.email,
        createdRole: user.role,
      }),
    );

    return user;
  }

  async updateUser(
    userId: string,
    updateData: Partial<InviteUserDto>,
    adminId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow changing role to ADMIN or PATIENT
    if (updateData.role && ![UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST].includes(updateData.role)) {
      throw new BadRequestException('Invalid role for update');
    }

    // Update user fields
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      user.email = updateData.email;
    }

    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.role) user.role = updateData.role;

    await this.userRepository.save(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.UPDATE_USER,
      `Admin updated user: ${user.email}`,
      adminId,
      JSON.stringify({
        updatedUserId: user.id,
        updatedFields: updateData,
      }),
    );

    return user;
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting admin users
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot delete admin users');
    }

    await this.userRepository.remove(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.DELETE_USER,
      `Admin deleted user: ${user.email}`,
      adminId,
      JSON.stringify({
        deletedUserId: user.id,
        deletedEmail: user.email,
        deletedRole: user.role,
      }),
    );
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: data.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivateUser(userId: string, adminId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await this.userRepository.save(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.UPDATE_USER,
      `Admin deactivated user: ${user.email}`,
      adminId,
      JSON.stringify({
        deactivatedUserId: user.id,
        deactivatedEmail: user.email,
      }),
    );

    return user;
  }

  async activateUser(userId: string, adminId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    await this.userRepository.save(user);

    // Log the action
    await this.logsService.createLog(
      LogAction.UPDATE_USER,
      `Admin activated user: ${user.email}`,
      adminId,
      JSON.stringify({
        activatedUserId: user.id,
        activatedEmail: user.email,
      }),
    );

    return user;
  }

  private generateTemporaryPassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
