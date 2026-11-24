import { IsString, IsNumber, IsOptional, IsDateString, Min, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({ example: 'Vacation Fund' })
  @IsString() @MaxLength(255)
  title: string;

  @ApiProperty({ example: 100000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  targetAmount: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  isShared?: boolean;
}

export class UpdateGoalDto extends PartialType(CreateGoalDto) {}

export class AddContributionDto {
  @ApiProperty({ example: 5000.00 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2024-05-01' })
  @IsDateString()
  date: string;
}
