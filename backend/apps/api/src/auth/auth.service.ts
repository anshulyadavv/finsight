import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: TokenPair }> {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      currency: dto.currency || 'INR',
    });
    await this.usersRepo.save(user);

    const tokens = await this.generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`New user registered: ${user.email}`);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: TokenPair }> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase(), isActive: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenPair> {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Session expired');

    const tokenMatch = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Refresh token mismatch');

    const tokens = await this.generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepo.update(userId, { refreshToken: null });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const newHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.usersRepo.update(userId, { passwordHash: newHash, refreshToken: null });
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user) throw new UnauthorizedException('User not found or inactive');
    return user;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email };
    const accessExpiresIn = this.configService.get<string>('jwt.accessExpiresIn');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: 900 }; // 15 min in seconds
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    await this.usersRepo.update(userId, { refreshToken: hashed });
  }
}
