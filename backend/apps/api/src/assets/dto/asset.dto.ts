import { IsString, IsNumber, IsEnum, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AssetType } from '../asset.entity';
import { IncomeFrequency } from '../income-source.entity';

export class CreateAssetDto {
  @ApiProperty({ example: 'HDFC Savings' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiProperty({ enum: AssetType, example: AssetType.BANK })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty({ example: 50000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  value: number;

  @ApiProperty({ example: 'INR', required: false })
  @IsOptional() @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}

export class CreateLiabilityDto {
  @ApiProperty({ example: 'Education Loan' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiProperty({ example: 500000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({ example: 450000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  remainingAmount: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsNumber()
  @Type(() => Number)
  interestRate?: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsNumber()
  @Type(() => Number)
  emi?: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsNumber()
  @Type(() => Number)
  dueDate?: number;
}

export class UpdateLiabilityDto extends PartialType(CreateLiabilityDto) {}

export class CreateIncomeSourceDto {
  @ApiProperty({ example: 'Rental Property' })
  @IsString() @MaxLength(255)
  name: string;

  @ApiProperty({ example: 25000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ enum: IncomeFrequency, example: IncomeFrequency.MONTHLY })
  @IsOptional() @IsEnum(IncomeFrequency)
  frequency?: IncomeFrequency;
}

export class UpdateIncomeSourceDto extends PartialType(CreateIncomeSourceDto) {}
