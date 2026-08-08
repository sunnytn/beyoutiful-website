import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

class PostDto {
  @IsString() @IsNotEmpty() @MaxLength(180) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() @IsNotEmpty() @MaxLength(400) excerpt: string;
  @IsString() @IsNotEmpty() content: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

class ListPostsDto extends PaginationDto {
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() q?: string;
}

@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(@Query() q: ListPostsDto) {
    return this.blog.list(q.page, q.limit, { tag: q.tag, q: q.q });
  }

  @Get('categories')
  categories() {
    return this.blog.listCategories();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  adminList(@Query() q: ListPostsDto) {
    return this.blog.list(q.page, q.limit, { tag: q.tag, q: q.q, includeUnpublished: true });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  adminDetail(@Param('id') id: string) {
    return this.blog.byId(id);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.blog.bySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  create(@CurrentUser() user: AuthUser, @Body() dto: PostDto) {
    return this.blog.create(user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: PostDto) {
    return this.blog.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.blog.remove(user.id, id);
  }
}
