import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { UpdateUnitStatusDto, UpdatePossessionDto } from './dto/unit.dto.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/inventory')
@UseGuards(AuthGuard)
export class UnitsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch('units/:unitId/status')
  @Roles(
    'ADMIN',
    'DIRECTOR',
    'BUSINESS_MANAGER',
    'SALES_MANAGER',
    'SALES_EXECUTIVE',
    'CLOSING_MANAGER',
    'POST_SALES_MANAGER',
    'POST_SALES',
    'CHANNEL_PARTNER',
  )
  async updateUnitStatus(
    @Param('unitId') unitId: string,
    @Body() data: UpdateUnitStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.inventoryService.updateUnitStatus(unitId, data, userId);
  }

  @Get('units/:unitId/booking')
  async getBookingForUnit(@Param('unitId') unitId: string) {
    return this.inventoryService.getBookingForUnit(unitId);
  }

  @Patch('projects/:projectId/possession')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'POST_SALES_MANAGER', 'CHANNEL_PARTNER')
  async updateProjectPossession(
    @Param('projectId') projectId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateProjectPossession(projectId, data);
  }

  @Patch('towers/:towerId/possession')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'POST_SALES_MANAGER', 'CHANNEL_PARTNER')
  async updateTowerPossession(
    @Param('towerId') towerId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateTowerPossession(towerId, data);
  }

  @Patch('units/:unitId/possession')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'POST_SALES_MANAGER', 'CHANNEL_PARTNER')
  async updateUnitPossession(
    @Param('unitId') unitId: string,
    @Body() data: UpdatePossessionDto,
  ) {
    return this.inventoryService.updateUnitPossession(unitId, data);
  }
}
