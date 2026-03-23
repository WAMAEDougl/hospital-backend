import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { BillingModule } from './billing/billing.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { EmailModule } from './email/email.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    PharmacyModule,
    BillingModule,
    PrescriptionsModule,
    EmailModule,
    LogsModule,
    AdminModule,
    HrModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule {}
