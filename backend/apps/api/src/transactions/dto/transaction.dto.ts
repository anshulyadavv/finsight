import {
  IsString, IsNumber, IsEnum, IsOptional, IsDateString,
  IsBoolean, IsUUID, Min, MaxLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType, PaymentMethod } from '../transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 450.00 })
  @IsNumber() @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'Swiggy' })
  @IsOptional() @IsString() @MaxLength(255)
  merchant?: string;

  @ApiProperty({ example: 'Ordered biryani via Swiggy' })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: '2025-03-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Category UUID', required: false })
  @IsOptional() @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: 'Raw SMS text for SMS-parsed transactions', required: false })
  @IsOptional() @IsString()
  smsRaw?: string;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class TransactionQueryDto {
  @IsOptional() @IsString()
  month?: string;          // YYYY-MM

  @IsOptional() @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional() @IsUUID()
  categoryId?: string;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsNumber()
  limit?: number = 20;

  @IsOptional() @IsString()
  sortBy?: string = 'date';

  @IsOptional() @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
