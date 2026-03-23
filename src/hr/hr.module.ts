import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { AttendanceRecord } from '../database/entities/attendance.entity';
import { PayrollRecord } from '../database/entities/payroll.entity';
import { LeaveBalance } from '../database/entities/leave-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, AttendanceRecord, PayrollRecord, LeaveBalance]),
  ],
  providers: [HrService],
  controllers: [HrController],
  exports: [HrService],
})
export class HrModule {}
