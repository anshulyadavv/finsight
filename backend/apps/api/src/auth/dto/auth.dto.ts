// ─────────────────────────────────────────────
//  auth/dto/auth.dto.ts
// ─────────────────────────────────────────────
import {
  IsEmail, IsString, MinLength, MaxLength, IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Rajan' })
  @IsString() @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 8 })
  @IsString() @MinLength(8) @MaxLength(64)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  currency?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString() @MinLength(8) @MaxLength(64)
  newPassword: string;
}
