import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { TaxonomyDto } from './categories.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get()
  list(@Query('all') all?: string) {
    return this.collections.list(all === 'true');
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.collections.bySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  create(@CurrentUser() user: AuthUser, @Body() dto: TaxonomyDto) {
    return this.collections.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: TaxonomyDto) {
    return this.collections.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.collections.remove(user.id, id);
  }
}
