import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { LeaveType } from '../../database/entities/leave-request.entity';
import { AttendanceStatus } from '../../database/entities/attendance.entity';
import { PayrollStatus } from '../../database/entities/payroll.entity';

export class CreateLeaveRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  employeeName: string;

  @IsEnum(LeaveType)
  type: LeaveType;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsString()
  reason: string;
}

export class UpdateLeaveStatusDto {
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  approvedBy?: string;
}

export class CreateAttendanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  employeeName: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  clockIn?: string;

  @IsOptional()
  @IsString()
  clockOut?: string;

  @IsOptional()
  @IsNumber()
  hoursWorked?: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  clockOut?: string;

  @IsOptional()
  @IsNumber()
  hoursWorked?: number;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePayrollDto {
  @IsString()
  employeeId: string;

  @IsString()
  employeeName: string;

  @IsString()
  month: string;

  @IsNumber()
  baseSalary: number;

  @IsObject()
  allowances: { housing: number; transport: number; medical: number; other: number };

  @IsObject()
  deductions: { tax: number; insurance: number; retirement: number; other: number };

  @IsObject()
  overtime: { hours: number; rate: number; amount: number };

  @IsNumber()
  grossSalary: number;

  @IsNumber()
  netSalary: number;
}

export class UpdateLeaveBalanceDto {
  @IsOptional()
  @IsNumber()
  vacation?: number;

  @IsOptional()
  @IsNumber()
  sick?: number;

  @IsOptional()
  @IsNumber()
  personal?: number;

  @IsOptional()
  @IsObject()
  used?: { vacation: number; sick: number; personal: number };
}
