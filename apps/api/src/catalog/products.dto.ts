import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class ListProductsDto extends PaginationDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() collection?: string;
  @IsOptional() @IsString() concern?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Max(1_000_000) maxPrice?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() featured?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() bestSeller?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() newArrival?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeInactive?: boolean;
}

class ImageDto {
  @IsString() @IsNotEmpty() url: string;
  @IsOptional() @IsString() alt?: string;
  @IsOptional() @IsString() publicId?: string;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
}

class VariantDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() name: string;
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
}

class ProductFaqDto {
  @IsString() @IsNotEmpty() question: string;
  @IsString() @IsNotEmpty() answer: string;
}

export class UpsertProductDto {
  @IsString() @IsNotEmpty() @MaxLength(160) name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() @MaxLength(300) shortDescription?: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsString() directions?: string;
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) compareAtPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isBestSeller?: boolean;
  @IsOptional() @IsBoolean() isNewArrival?: boolean;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) concerns?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) collectionIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) ingredientIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedSlugs?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ImageDto) images?: ImageDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VariantDto) variants?: VariantDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductFaqDto) faqs?: ProductFaqDto[];
}
