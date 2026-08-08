import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

class SynonymDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() term: string;
  @IsArray() @IsString({ each: true }) mapsTo: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  query(@Query('q') q: string) {
    return this.search.search(q ?? '');
  }

  @Get('admin/synonyms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  listSynonyms() {
    return this.search.listSynonyms();
  }

  @Post('admin/synonyms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  upsertSynonym(@CurrentUser() user: AuthUser, @Body() dto: SynonymDto) {
    return this.search.upsertSynonym(user.id, dto);
  }

  @Delete('admin/synonyms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeSynonym(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.search.removeSynonym(user.id, id);
  }
}
