import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail } from 'class-validator';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

class EmailDto {
  @IsEmail() email: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post('subscribe')
  @Throttle({ strict: { ttl: 60_000, limit: 5 } })
  subscribe(@Body() dto: EmailDto) {
    return this.newsletter.subscribe(dto.email);
  }

  @Post('unsubscribe')
  unsubscribe(@Body() dto: EmailDto) {
    return this.newsletter.unsubscribe(dto.email);
  }

  @Get('admin/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list(@Query() q: PaginationDto) {
    return this.newsletter.list(q.page, q.limit);
  }

  @Get('admin/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  export() {
    return this.newsletter.exportEmails();
  }
}
