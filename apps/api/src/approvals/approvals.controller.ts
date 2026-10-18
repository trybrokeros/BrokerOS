import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { put } from '@vercel/blob';
import { ApprovalsService } from './approvals.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CreateApprovalRequestDto,
  AddApprovalMessageDto,
} from './dto/approvals.dto.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('api/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { url: null };
    const blob = await put(
      `approvals/${Date.now()}-${file.originalname}`,
      file.buffer,
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      },
    );
    return { url: blob.url };
  }

  @Post()
  async createRequest(@Req() req, @Body() body: CreateApprovalRequestDto) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.createRequest(userId, body);
  }

  @Get()
  async getRequests(@Req() req) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.getRequests(userId);
  }

  @Get(':id')
  async getRequestDetails(@Param('id') id: string) {
    return this.approvalsService.getRequestDetails(id);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Req() req,
    @Body() body: AddApprovalMessageDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.addMessage(id, userId, body);
  }

  @Patch(':id/close')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'POST_SALES_MANAGER', 'CHANNEL_PARTNER')
  async closeRequest(@Param('id') id: string) {
    return this.approvalsService.closeRequest(id);
  }

  @Post(':id/redo')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'PRE_SALES_MANAGER', 'POST_SALES_MANAGER', 'CHANNEL_PARTNER')
  async redoRequestDecision(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.redoRequestDecision(id, userId);
  }
}
