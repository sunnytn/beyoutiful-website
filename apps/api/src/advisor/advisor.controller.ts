import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdvisorGoal } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength,
} from 'class-validator';
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

class RecommendDto {
  @IsEnum(AdvisorGoal) goal: AdvisorGoal;
  @IsString() @IsNotEmpty() concern: string;
  @IsOptional() @IsObject() profile?: Record<string, string>;
}

class ConcernDto {
  @IsOptional() @IsString() id?: string;
  @IsEnum(AdvisorGoal) goal: AdvisorGoal;
  @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class RuleDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() @MaxLength(160) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsInt() priority?: number;
  @IsObject() conditions: Record<string, unknown>;
  @IsArray() productSlugs: unknown[];
  @IsOptional() @IsArray() routine?: unknown[];
  @IsOptional() @IsArray() @IsString({ each: true }) blogSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) faqIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) beforeAfterIds?: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisor: AdvisorService) {}

  @Get('config')
  config() {
    return this.advisor.config();
  }

  @Post('recommend')
  @Throttle({ strict: { ttl: 60_000, limit: 20 } })
  recommend(@Body() dto: RecommendDto) {
    return this.advisor.recommend(dto);
  }

  // ── Admin ──
  @Get('admin/concerns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  listConcerns() {
    return this.advisor.listConcerns();
  }

  @Post('admin/concerns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  upsertConcern(@CurrentUser() user: AuthUser, @Body() dto: ConcernDto) {
    return this.advisor.upsertConcern(user.id, dto);
  }

  @Delete('admin/concerns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeConcern(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.advisor.removeConcern(user.id, id);
  }

  @Get('admin/rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  listRules() {
    return this.advisor.listRules();
  }

  @Post('admin/rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  upsertRule(@CurrentUser() user: AuthUser, @Body() dto: RuleDto) {
    return this.advisor.upsertRule(user.id, dto);
  }

  @Delete('admin/rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeRule(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.advisor.removeRule(user.id, id);
  }
}
