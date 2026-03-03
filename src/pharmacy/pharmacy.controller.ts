import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pharmacy')
@UseGuards(JwtAuthGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.pharmacyService.create(createMedicineDto);
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.pharmacyService.findAll(+page, +limit);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pharmacyService.search(query, +page, +limit);
  }

  @Get('category/:category')
  findByCategory(
    @Param('category') category: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pharmacyService.findByCategory(category, +page, +limit);
  }

  @Get('low-stock')
  findLowStock(
    @Query('threshold') threshold: string = '10',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pharmacyService.findLowStock(+threshold, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.pharmacyService.update(id, updateMedicineDto);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.pharmacyService.updateStock(id, updateStockDto.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(id);
  }
}
