import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Asset, AssetType } from './asset.entity';
import { Liability } from './liability.entity';
import { IncomeSource, IncomeFrequency } from './income-source.entity';
import { CreateAssetDto, UpdateAssetDto, CreateLiabilityDto, UpdateLiabilityDto, CreateIncomeSourceDto, UpdateIncomeSourceDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetRepo: Repository<Asset>,
    @InjectRepository(Liability) private readonly liabilityRepo: Repository<Liability>,
    @InjectRepository(IncomeSource) private readonly incomeRepo: Repository<IncomeSource>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async clearCache(userId: string) {
    await this.cache.del(`net-worth:${userId}`);
    await this.cache.del(`assets:${userId}`);
  }

  // --- Assets ---
  async createAsset(userId: string, dto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepo.create({ ...dto, userId });
    await this.assetRepo.save(asset);
    await this.clearCache(userId);
    return asset;
  }

  async getAssets(userId: string): Promise<Asset[]> {
    const cached = await this.cache.get<Asset[]>(`assets:${userId}`);
    if (cached) return cached;
    const assets = await this.assetRepo.find({ where: { userId } });
    await this.cache.set(`assets:${userId}`, assets, 120000);
    return assets;
  }

  async updateAsset(userId: string, id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.assetRepo.findOne({ where: { id, userId } });
    if (!asset) throw new NotFoundException('Asset not found');
    Object.assign(asset, dto);
    await this.assetRepo.save(asset);
    await this.clearCache(userId);
    return asset;
  }

  async deleteAsset(userId: string, id: string): Promise<void> {
    const result = await this.assetRepo.delete({ id, userId });
    if (result.affected === 0) throw new NotFoundException('Asset not found');
    await this.clearCache(userId);
  }

  // --- Liabilities ---
  async createLiability(userId: string, dto: CreateLiabilityDto): Promise<Liability> {
    const liability = this.liabilityRepo.create({ ...dto, userId });
    await this.liabilityRepo.save(liability);
    await this.clearCache(userId);
    return liability;
  }

  async getLiabilities(userId: string): Promise<Liability[]> {
    return this.liabilityRepo.find({ where: { userId } });
  }

  async updateLiability(userId: string, id: string, dto: UpdateLiabilityDto): Promise<Liability> {
    const liability = await this.liabilityRepo.findOne({ where: { id, userId } });
    if (!liability) throw new NotFoundException('Liability not found');
    Object.assign(liability, dto);
    await this.liabilityRepo.save(liability);
    await this.clearCache(userId);
    return liability;
  }

  async deleteLiability(userId: string, id: string): Promise<void> {
    const result = await this.liabilityRepo.delete({ id, userId });
    if (result.affected === 0) throw new NotFoundException('Liability not found');
    await this.clearCache(userId);
  }

  // --- Income Sources ---
  async createIncomeSource(userId: string, dto: CreateIncomeSourceDto): Promise<IncomeSource> {
    const src = this.incomeRepo.create({ ...dto, userId });
    await this.incomeRepo.save(src);
    return src;
  }

  async getIncomeSources(userId: string): Promise<IncomeSource[]> {
    return this.incomeRepo.find({ where: { userId } });
  }
  
  async updateIncomeSource(userId: string, id: string, dto: UpdateIncomeSourceDto): Promise<IncomeSource> {
    const src = await this.incomeRepo.findOne({ where: { id, userId } });
    if (!src) throw new NotFoundException('Income source not found');
    Object.assign(src, dto);
    await this.incomeRepo.save(src);
    return src;
  }

  async deleteIncomeSource(userId: string, id: string): Promise<void> {
    await this.incomeRepo.delete({ id, userId });
  }

  // --- Net Worth Engine ---
  async getNetWorth(userId: string) {
    const cacheKey = `net-worth:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const assets = await this.assetRepo.find({ where: { userId } });
    const liabilities = await this.liabilityRepo.find({ where: { userId } });
    const incomes = await this.incomeRepo.find({ where: { userId } });

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.remainingAmount), 0);
    const netWorth = totalAssets - totalLiabilities;

    let passiveIncomeMonthly = 0;
    incomes.forEach(i => {
      passiveIncomeMonthly += (i.frequency === IncomeFrequency.YEARLY) ? Number(i.amount) / 12 : Number(i.amount);
    });

    const assetsByType = Object.values(AssetType).reduce((acc, type) => {
      acc[type] = assets.filter(a => a.type === type).reduce((sum, a) => sum + Number(a.value), 0);
      return acc;
    }, {} as Record<string, number>);

    const result = {
      netWorth,
      totalAssets,
      totalLiabilities,
      passiveIncomeMonthly,
      breakdown: {
        assetsByType,
        liabilities: liabilities.map(l => ({ name: l.name, remaining: Number(l.remainingAmount) }))
      }
    };

    await this.cache.set(cacheKey, result, 120000); // 2 minutes string cache
    return result;
  }
}
