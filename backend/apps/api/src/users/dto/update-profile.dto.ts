import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() monthlyIncome?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsBoolean() notificationEmail?: boolean;
  @IsOptional() @IsBoolean() notificationPush?: boolean;
}
