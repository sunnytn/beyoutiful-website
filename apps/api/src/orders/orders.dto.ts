import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString,
  Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

export class OrderItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsOptional() @IsString() variantId?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(50) quantity: number;
}

export class CreateOrderDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString() @IsNotEmpty() @MaxLength(120) fullName: string;
  @IsEmail() email: string;
  @IsString() @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Enter a valid phone number' }) phone: string;
  @IsString() @IsNotEmpty() @MaxLength(400) address: string;
  @IsString() @IsNotEmpty() @MaxLength(80) city: string;
  @IsOptional() @IsString() @MaxLength(12) postalCode?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class ListOrdersDto extends PaginationDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() q?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
}
