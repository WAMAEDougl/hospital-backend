import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { HrService } from './hr.service';
import {
  CreateLeaveRequestDto, UpdateLeaveStatusDto,
  CreateAttendanceDto, UpdateAttendanceDto,
  CreatePayrollDto, UpdateLeaveBalanceDto,
} from './dto/hr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ─── Leave Requests ───────────────────────────────────────────────

  @Get('leave')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  getLeaveRequests(@Query('status') status?: string, @Query('employeeId') employeeId?: string) {
    return this.hrService.getLeaveRequests(status, employeeId);
  }

  @Post('leave')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  createLeaveRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.hrService.createLeaveRequest(dto);
  }

  @Patch('leave/:id/status')
  @Roles('ADMIN')
  updateLeaveStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto, @Request() req) {
    const adminName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Admin';
    return this.hrService.updateLeaveStatus(id, dto, adminName);
  }

  @Delete('leave/:id')
  @Roles('ADMIN')
  async deleteLeaveRequest(@Param('id') id: string) {
    await this.hrService.deleteLeaveRequest(id);
    return { message: 'Leave request deleted' };
  }

  // ─── Attendance ───────────────────────────────────────────────────

  @Get('attendance')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  getAttendance(
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.hrService.getAttendance(date, status, employeeId);
  }

  @Post('attendance')
  @Roles('ADMIN')
  createAttendance(@Body() dto: CreateAttendanceDto) {
    return this.hrService.createAttendance(dto);
  }

  @Post('attendance/clock-in')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  clockIn(@Body() body: { employeeId: string; employeeName: string }) {
    return this.hrService.clockIn(body.employeeId, body.employeeName);
  }

  @Patch('attendance/:id/clock-out')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  clockOut(@Param('id') id: string) {
    return this.hrService.clockOut(id);
  }

  @Patch('attendance/:id')
  @Roles('ADMIN')
  updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.hrService.updateAttendance(id, dto);
  }

  @Delete('attendance/:id')
  @Roles('ADMIN')
  async deleteAttendance(@Param('id') id: string) {
    await this.hrService.deleteAttendance(id);
    return { message: 'Attendance record deleted' };
  }

  // ─── Payroll ──────────────────────────────────────────────────────

  @Get('payroll')
  @Roles('ADMIN')
  getPayroll(@Query('month') month?: string, @Query('employeeId') employeeId?: string) {
    return this.hrService.getPayroll(month, employeeId);
  }

  @Post('payroll')
  @Roles('ADMIN')
  createPayroll(@Body() dto: CreatePayrollDto) {
    return this.hrService.createPayroll(dto);
  }

  @Patch('payroll/:id/process')
  @Roles('ADMIN')
  processPayroll(@Param('id') id: string) {
    return this.hrService.processPayroll(id);
  }

  @Patch('payroll/:id/paid')
  @Roles('ADMIN')
  markPayrollPaid(@Param('id') id: string) {
    return this.hrService.markPayrollPaid(id);
  }

  @Patch('payroll/:id')
  @Roles('ADMIN')
  updatePayroll(@Param('id') id: string, @Body() dto: Partial<CreatePayrollDto>) {
    return this.hrService.updatePayroll(id, dto);
  }

  @Delete('payroll/:id')
  @Roles('ADMIN')
  async deletePayroll(@Param('id') id: string) {
    await this.hrService.deletePayroll(id);
    return { message: 'Payroll record deleted' };
  }

  // ─── Leave Balances ───────────────────────────────────────────────

  @Get('leave-balances')
  @Roles('ADMIN')
  getAllLeaveBalances() {
    return this.hrService.getAllLeaveBalances();
  }

  @Get('leave-balances/:employeeId')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  getLeaveBalance(@Param('employeeId') employeeId: string) {
    return this.hrService.getLeaveBalance(employeeId);
  }

  @Patch('leave-balances/:employeeId')
  @Roles('ADMIN')
  updateLeaveBalance(@Param('employeeId') employeeId: string, @Body() dto: UpdateLeaveBalanceDto) {
    return this.hrService.updateLeaveBalance(employeeId, dto);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  @Get('stats')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  getStats() {
    return this.hrService.getHrStats();
  }
}
