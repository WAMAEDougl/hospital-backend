import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from '../database/entities/leave-request.entity';
import { AttendanceRecord, AttendanceStatus } from '../database/entities/attendance.entity';
import { PayrollRecord, PayrollStatus } from '../database/entities/payroll.entity';
import { LeaveBalance } from '../database/entities/leave-balance.entity';
import {
  CreateLeaveRequestDto, UpdateLeaveStatusDto,
  CreateAttendanceDto, UpdateAttendanceDto,
  CreatePayrollDto, UpdateLeaveBalanceDto,
} from './dto/hr.dto';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(AttendanceRecord)
    private attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(PayrollRecord)
    private payrollRepo: Repository<PayrollRecord>,
    @InjectRepository(LeaveBalance)
    private balanceRepo: Repository<LeaveBalance>,
  ) {}

  // ─── Leave Requests ───────────────────────────────────────────────

  async createLeaveRequest(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const leave = this.leaveRepo.create({ ...dto, status: LeaveStatus.PENDING });
    return this.leaveRepo.save(leave);
  }

  async getLeaveRequests(status?: string, employeeId?: string) {
    const qb = this.leaveRepo.createQueryBuilder('lr').orderBy('lr.requestedAt', 'DESC');
    if (status && status !== 'all') qb.andWhere('lr.status = :status', { status });
    if (employeeId) qb.andWhere('lr.employeeId = :employeeId', { employeeId });
    return qb.getMany();
  }

  async updateLeaveStatus(id: string, dto: UpdateLeaveStatusDto, adminName: string): Promise<LeaveRequest> {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = dto.status as LeaveStatus;
    leave.approvedBy = adminName;
    leave.approvedAt = new Date().toISOString().split('T')[0];
    return this.leaveRepo.save(leave);
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    await this.leaveRepo.remove(leave);
  }

  // ─── Attendance ───────────────────────────────────────────────────

  async createAttendance(dto: CreateAttendanceDto): Promise<AttendanceRecord> {
    // Prevent duplicate for same employee+date
    const existing = await this.attendanceRepo.findOne({
      where: { employeeId: dto.employeeId, date: dto.date },
    });
    if (existing) throw new ConflictException('Attendance record already exists for this employee on this date');
    const record = this.attendanceRepo.create(dto);
    return this.attendanceRepo.save(record);
  }

  async getAttendance(date?: string, status?: string, employeeId?: string) {
    const qb = this.attendanceRepo.createQueryBuilder('ar').orderBy('ar.date', 'DESC').addOrderBy('ar.clockIn', 'ASC');
    if (date) qb.andWhere('ar.date = :date', { date });
    if (status && status !== 'all') qb.andWhere('ar.status = :status', { status });
    if (employeeId) qb.andWhere('ar.employeeId = :employeeId', { employeeId });
    return qb.getMany();
  }

  async clockIn(employeeId: string, employeeName: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.attendanceRepo.findOne({ where: { employeeId, date: today } });
    if (existing) throw new ConflictException('Already clocked in today');
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const hour = now.getHours();
    const status = hour >= 9 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
    const record = this.attendanceRepo.create({ employeeId, employeeName, date: today, clockIn: timeStr, status });
    return this.attendanceRepo.save(record);
  }

  async clockOut(recordId: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Attendance record not found');
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    record.clockOut = timeStr;
    if (record.clockIn) {
      const [inH, inM] = record.clockIn.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      record.hoursWorked = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
    }
    return this.attendanceRepo.save(record);
  }

  async updateAttendance(id: string, dto: UpdateAttendanceDto): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Attendance record not found');
    Object.assign(record, dto);
    return this.attendanceRepo.save(record);
  }

  async deleteAttendance(id: string): Promise<void> {
    const record = await this.attendanceRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Attendance record not found');
    await this.attendanceRepo.remove(record);
  }

  // ─── Payroll ──────────────────────────────────────────────────────

  async createPayroll(dto: CreatePayrollDto): Promise<PayrollRecord> {
    const existing = await this.payrollRepo.findOne({
      where: { employeeId: dto.employeeId, month: dto.month },
    });
    if (existing) throw new ConflictException('Payroll record already exists for this employee and month');
    const record = this.payrollRepo.create({ ...dto, status: PayrollStatus.PENDING });
    return this.payrollRepo.save(record);
  }

  async getPayroll(month?: string, employeeId?: string) {
    const qb = this.payrollRepo.createQueryBuilder('pr').orderBy('pr.month', 'DESC');
    if (month && month !== 'all') qb.andWhere('pr.month = :month', { month });
    if (employeeId) qb.andWhere('pr.employeeId = :employeeId', { employeeId });
    return qb.getMany();
  }

  async processPayroll(id: string): Promise<PayrollRecord> {
    const record = await this.payrollRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Payroll record not found');
    record.status = PayrollStatus.PROCESSED;
    record.processedAt = new Date().toISOString().split('T')[0];
    return this.payrollRepo.save(record);
  }

  async markPayrollPaid(id: string): Promise<PayrollRecord> {
    const record = await this.payrollRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Payroll record not found');
    record.status = PayrollStatus.PAID;
    record.paidAt = new Date().toISOString().split('T')[0];
    return this.payrollRepo.save(record);
  }

  async updatePayroll(id: string, dto: Partial<CreatePayrollDto>): Promise<PayrollRecord> {
    const record = await this.payrollRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Payroll record not found');
    Object.assign(record, dto);
    return this.payrollRepo.save(record);
  }

  async deletePayroll(id: string): Promise<void> {
    const record = await this.payrollRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Payroll record not found');
    await this.payrollRepo.remove(record);
  }

  // ─── Leave Balances ───────────────────────────────────────────────

  async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    let balance = await this.balanceRepo.findOne({ where: { employeeId } });
    if (!balance) {
      balance = this.balanceRepo.create({ employeeId, vacation: 20, sick: 10, personal: 5, used: { vacation: 0, sick: 0, personal: 0 } });
      await this.balanceRepo.save(balance);
    }
    return balance;
  }

  async getAllLeaveBalances(): Promise<LeaveBalance[]> {
    return this.balanceRepo.find({ order: { employeeId: 'ASC' } });
  }

  async updateLeaveBalance(employeeId: string, dto: UpdateLeaveBalanceDto): Promise<LeaveBalance> {
    let balance = await this.balanceRepo.findOne({ where: { employeeId } });
    if (!balance) {
      balance = this.balanceRepo.create({ employeeId, vacation: 20, sick: 10, personal: 5, used: { vacation: 0, sick: 0, personal: 0 } });
    }
    if (dto.vacation !== undefined) balance.vacation = dto.vacation;
    if (dto.sick !== undefined) balance.sick = dto.sick;
    if (dto.personal !== undefined) balance.personal = dto.personal;
    if (dto.used !== undefined) balance.used = dto.used;
    return this.balanceRepo.save(balance);
  }

  // ─── Analytics ────────────────────────────────────────────────────

  async getHrStats() {
    const today = new Date().toISOString().split('T')[0];
    const [totalLeave, pendingLeave, todayAttendance, totalPayroll] = await Promise.all([
      this.leaveRepo.count(),
      this.leaveRepo.count({ where: { status: LeaveStatus.PENDING } }),
      this.attendanceRepo.find({ where: { date: today } }),
      this.payrollRepo.find({ where: { status: PayrollStatus.PENDING } }),
    ]);
    const presentToday = todayAttendance.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    return { totalLeave, pendingLeave, presentToday, pendingPayroll: totalPayroll.length };
  }
}
