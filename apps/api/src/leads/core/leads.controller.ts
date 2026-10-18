import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service.js';
import { LeadStatus } from '@brokeros/prisma';
import { Public } from '@thallesp/nestjs-better-auth';
import {
  CreateLeadDto,
  BulkCreateLeadsDto,
  AssignLeadsDto,
  UpdateLeadStatusDto,
  UpdateLeadDto,
  GetLeadsFilterDto,
} from './dto/lead.dto.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: GetLeadsFilterDto) {
    return this.leadsService.findAll({
      ...query,
      userId: req.user?.id,
      roleId: req.user?.roleId,
    });
  }

  @Post()
  createLead(@Req() req: any, @Body() data: CreateLeadDto) {
    return this.leadsService.create(data, req.user?.id);
  }

  @Post('bulk-create')
  bulkCreate(@Req() req: any, @Body() body: BulkCreateLeadsDto) {
    return this.leadsService.bulkCreate(body.leads, req.user?.id);
  }

  @Post('assign')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'CHANNEL_PARTNER')
  assignLeads(@Req() req: any, @Body() data: AssignLeadsDto) {
    return this.leadsService.assignLeads(
      data.leadIds,
      req.user?.id,
      data.targetUserId,
      data.roundRobin,
    );
  }

  @Get('employee/:employeeId')
  async getEmployeeLeads(
    @Req() req: any,
    @Param('employeeId') employeeId: string,
  ) {
    return this.leadsService.findAll({
      assignedToId: employeeId,
      userId: req.user?.id,
      roleId: req.user?.roleId,
    });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(id, req.user?.id, req.user?.roleId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, body.status, body.subStatus);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: UpdateLeadDto) {
    return this.leadsService.update(id, updateData);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.leadsService.uploadAvatar(id, file);
  }

  @Public()
  @Get(':id/avatar-image')
  async getAvatarImage(@Param('id') id: string, @Res() res: any) {
    try {
      const avatar = await this.leadsService.getAvatarStream(id);
      if (!avatar) {
        return res.status(404).send('No avatar found');
      }

      res.set({
        'Content-Type': avatar.contentType,
      });

      return res.send(avatar.buffer);
    } catch {
      return res.status(500).send('Internal server error');
    }
  }
}
