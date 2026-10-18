import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from '../core/inventory.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import {
  ProjectQueryDto,
  CreateProjectDto,
  AssignProjectDto,
} from './dto/project.dto.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/inventory/projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getProjects(@Query() query: ProjectQueryDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.inventoryService.getProjects(query, userId);
  }

  @Post()
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'CHANNEL_PARTNER')
  async createProject(@Body() data: CreateProjectDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.inventoryService.createProject(data, userId);
  }

  @Get(':projectId/towers')
  async getProjectTowers(
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.inventoryService.getProjectTowers(projectId, userId);
  }

  @Get('towers/:towerId/assignments')
  async getTowerAssignments(@Param('towerId') towerId: string) {
    return this.inventoryService.getTowerAssignments(towerId);
  }

  @Post('towers/:towerId/assign')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'SOURCING_MANAGER', 'CHANNEL_PARTNER')
  async assignTower(
    @Param('towerId') towerId: string,
    @Body() data: AssignProjectDto,
  ) {
    return this.inventoryService.assignTower(
      towerId,
      data.sourcingManagerIds || [],
      data.closingManagerIds || [],
      data.salesExecIds || [],
    );
  }

  @Get(':projectId/assignments')
  async getProjectAssignments(@Param('projectId') projectId: string) {
    return this.inventoryService.getProjectAssignments(projectId);
  }

  @Post(':projectId/assign')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'SOURCING_MANAGER', 'CHANNEL_PARTNER')
  async assignProject(
    @Param('projectId') projectId: string,
    @Body() data: AssignProjectDto,
  ) {
    return this.inventoryService.assignProject(
      projectId,
      data.sourcingManagerIds || [],
      data.closingManagerIds || [],
      data.salesExecIds || [],
    );
  }
}
