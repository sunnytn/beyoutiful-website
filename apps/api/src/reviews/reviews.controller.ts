import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

class SubmitReviewDto {
  @IsString() @IsNotEmpty() productSlug: string;
  @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @IsOptional() @IsEmail() email?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() @MaxLength(140) title?: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) body: string;
}

class ListReviewsDto extends PaginationDto {
  @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
}

class ModerateDto {
  @IsEnum(ReviewStatus) status: ReviewStatus;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @Throttle({ strict: { ttl: 60_000, limit: 3 } })
  submit(@Body() dto: SubmitReviewDto) {
    return this.reviews.submit(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list(@Query() q: ListReviewsDto) {
    return this.reviews.list(q.status, q.page, q.limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  moderate(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ModerateDto) {
    return this.reviews.moderate(user.id, id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reviews.remove(user.id, id);
  }
}
