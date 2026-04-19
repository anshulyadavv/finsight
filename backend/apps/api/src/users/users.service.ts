import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.monthlyIncome !== undefined) user.monthlyIncome = dto.monthlyIncome;
    if (dto.currency !== undefined) user.currency = dto.currency;
    if (dto.notificationEmail !== undefined) user.notificationEmail = dto.notificationEmail;
    if (dto.notificationPush !== undefined) user.notificationPush = dto.notificationPush;

    return this.userRepo.save(user);
  }
}
