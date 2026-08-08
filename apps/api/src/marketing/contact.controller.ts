import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

class ContactDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsString() @MaxLength(160) subject?: string;
  @IsString() @IsNotEmpty() @MaxLength(3000) message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @Throttle({ strict: { ttl: 60_000, limit: 3 } })
  submit(@Body() dto: ContactDto) {
    return this.contact.submit(dto);
  }

  @Get('admin/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list(@Query() q: PaginationDto) {
    return this.contact.list(q.page, q.limit);
  }

  @Patch('admin/messages/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  markRead(@Param('id') id: string) {
    return this.contact.markRead(id);
  }

  @Delete('admin/messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.contact.remove(id);
  }
}
