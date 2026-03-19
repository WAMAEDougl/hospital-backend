import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('invite-user')
  async inviteUser(@Body() inviteDto: InviteUserDto, @Request() req) {
    return this.adminService.inviteUser(inviteDto, req.user.userId);
  }

  @Post('create-user')
  async createUser(@Body() createUserDto: InviteUserDto, @Request() req) {
    return this.adminService.createUser(createUserDto, req.user.userId);
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Patch('users/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateData: Partial<InviteUserDto>,
    @Request() req,
  ) {
    return this.adminService.updateUser(userId, updateData, req.user.userId);
  }

  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string, @Request() req) {
    await this.adminService.deleteUser(userId, req.user.userId);
    return { message: 'User deleted successfully' };
  }

  @Patch('users/:userId/deactivate')
  async deactivateUser(@Param('userId') userId: string, @Request() req) {
    return this.adminService.deactivateUser(userId, req.user.userId);
  }

  @Patch('users/:userId/activate')
  async activateUser(@Param('userId') userId: string, @Request() req) {
    return this.adminService.activateUser(userId, req.user.userId);
  }
}
