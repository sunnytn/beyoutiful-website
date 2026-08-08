import {
  Body, Controller, Delete, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class DeleteImageDto {
  @IsString() @IsNotEmpty() publicId: string;
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    return this.uploads.uploadImage(file, folder);
  }

  @Delete('image')
  remove(@Body() dto: DeleteImageDto) {
    return this.uploads.deleteImage(dto.publicId);
  }
}
