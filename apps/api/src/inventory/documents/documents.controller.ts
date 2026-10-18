import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service.js';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { UploadDocumentDto } from './dto/document.dto.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/inventory/projects/:projectId/documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async getDocuments(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query('towerId') towerId?: string,
  ) {
    let docs = await this.documentsService.getDocuments(projectId, towerId);

    // Sales Executives only see public documents
    if (req.user?.roleId === 2) {
      docs = docs.filter((d) => d.isPublic);
    }

    return docs.map((doc) => ({
      ...doc,
      fileUrl: `/api/proxy/api/inventory/projects/${projectId}/documents/${doc.id}/file`,
    }));
  }

  @Post()
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'SOURCING_MANAGER', 'CHANNEL_PARTNER')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('projectId') projectId: string,
    @Body() body: UploadDocumentDto,
    @UploadedFile() file: any,
  ) {
    return this.documentsService.uploadDocument(projectId, file, body);
  }

  @Get(':id/file')
  async getDocumentFile(@Param('id') id: string, @Res() res: any) {
    const doc = await this.documentsService.getDocument(id);
    if (!doc || !doc.fileUrl) {
      return res.status(404).send('File not found');
    }

    try {
      const blobRes = await fetch(doc.fileUrl, {
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      });

      if (!blobRes.ok) {
        return res
          .status(blobRes.status)
          .send('Failed to fetch file from blob storage');
      }

      res.set({
        'Content-Type': doc.fileType || 'application/octet-stream',
      });
      if (doc.fileSize) {
        res.set('Content-Length', doc.fileSize);
      }

      const arrayBuffer = await blobRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (e) {
      console.error('Error fetching blob:', e);
      res.status(500).send('Internal server error');
    }
  }

  @Delete(':id')
  @Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'CHANNEL_PARTNER')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
