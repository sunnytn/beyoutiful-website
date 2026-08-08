import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

class SeoEntryDto {
  @IsString() @IsNotEmpty() path: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsString() ogImageUrl?: string;
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsBoolean() noIndex?: boolean;
}

@Controller('seo')
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('entry')
  byPath(@Query('path') path: string) {
    return this.seo.byPath(path ?? '/');
  }

  @Get('sitemap-data')
  sitemapData() {
    return this.seo.sitemapData();
  }

  @Get('admin/entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list() {
    return this.seo.list();
  }

  @Put('admin/entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  upsert(@CurrentUser() user: AuthUser, @Body() dto: SeoEntryDto) {
    return this.seo.upsert(user.id, dto);
  }

  @Delete('admin/entries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.seo.remove(user.id, id);
  }
}
