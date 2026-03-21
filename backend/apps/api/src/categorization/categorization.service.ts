import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { Category } from '../categories/category.entity';

interface CategorizationResult {
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  source: 'rule' | 'ml' | 'default';
}

// ─── Keyword map: merchant/description fragments → category names ─────────
const KEYWORD_MAP: Record<string, string[]> = {
  Food: [
    'swiggy', 'zomato', 'dominos', 'pizza', 'mcdonald', 'kfc', 'subway',
    'burger', 'cafe', 'restaurant', 'hotel', 'dhaba', 'biryani', 'starbucks',
    'chaayos', 'barbeque', 'dunkin', 'haldiram', 'amul',
  ],
  Transport: [
    'uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip', 'goibibo',
    'petrol', 'diesel', 'bpcl', 'hpcl', 'indane', 'fuel', 'fastag',
    'parking', 'cab', 'auto', 'bus', 'train', 'flight', 'air india',
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal',
    'reliance', 'bigbasket', 'blinkit', 'zepto', 'instamart', 'grofers',
    'dmart', 'lifestyle', 'shoppers stop', 'westside',
  ],
  Housing: [
    'rent', 'housing', 'nobroker', 'magicbricks', 'maintenance', 'society',
    'electricity', 'water', 'municipal', 'property',
  ],
  Health: [
    'apollo', 'medplus', 'netmeds', 'pharmeasy', '1mg', 'practo', 'cure.fit',
    'gym', 'fitness', 'hospital', 'clinic', 'pharmacy', 'medicine', 'doctor',
    'healthify', 'cult', 'tata health',
  ],
  Entertainment: [
    'netflix', 'hotstar', 'prime video', 'sony liv', 'zee5', 'jio cinema',
    'spotify', 'gaana', 'youtube', 'game', 'pubg', 'pvr', 'inox', 'cinepolis',
    'book my show', 'lenskart',
  ],
  Utilities: [
    'airtel', 'jio', 'vodafone', 'vi ', 'bsnl', 'tata sky', 'dish tv',
    'tata power', 'bescom', 'mseb', 'electricity', 'broadband', 'wifi',
    'recharge', 'dth', 'postpaid',
  ],
  Education: [
    'byju', 'unacademy', 'vedantu', 'coursera', 'udemy', 'upgrad', 'duolingo',
    'school', 'college', 'university', 'coaching', 'tuition', 'book',
  ],
  Finance: [
    'emi', 'loan', 'insurance', 'lic', 'sbi life', 'hdfc life', 'mutual fund',
    'sip', 'zerodha', 'groww', 'upstox', 'credit card', 'tax', 'gst',
  ],
};

@Injectable()
export class CategorizationService {
  private readonly logger = new Logger(CategorizationService.name);
  private categoryCache: Map<string, string> = new Map(); // name → id

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async categorize(text: string): Promise<CategorizationResult> {
    if (!text?.trim()) return { categoryId: null, categoryName: null, confidence: 0, source: 'default' };

    const normalised = text.toLowerCase().trim();

    // 1. Rule-based — fast path
    const ruleResult = await this.ruleBasedCategorize(normalised);
    if (ruleResult.confidence >= 0.8) return ruleResult;

    // 2. ML-based — higher accuracy
    try {
      const mlResult = await this.mlCategorize(normalised);
      if (mlResult && mlResult.confidence > ruleResult.confidence) return mlResult;
    } catch {
      this.logger.warn('ML categorization unavailable, falling back to rule-based');
    }

    return ruleResult.confidence > 0 ? ruleResult : {
      categoryId: await this.getCategoryId('Other'),
      categoryName: 'Other',
      confidence: 0.3,
      source: 'default',
    };
  }

  // ─── Rule-based ───────────────────────────────────────────────────────────

  private async ruleBasedCategorize(text: string): Promise<CategorizationResult> {
    for (const [categoryName, keywords] of Object.entries(KEYWORD_MAP)) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          return {
            categoryId:   await this.getCategoryId(categoryName),
            categoryName,
            confidence:   0.85,
            source:       'rule',
          };
        }
      }
    }
    return { categoryId: null, categoryName: null, confidence: 0, source: 'rule' };
  }

  // ─── ML-based ─────────────────────────────────────────────────────────────

  private async mlCategorize(text: string): Promise<CategorizationResult | null> {
    const cacheKey = `cat:ml:${text.slice(0, 60)}`;
    const cached = await this.cache.get<CategorizationResult>(cacheKey);
    if (cached) return cached;

    const baseUrl = this.configService.get<string>('ml.baseUrl');
    const timeout = this.configService.get<number>('ml.timeout');

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/categorize`,
        { description: text },
        { timeout: Math.min(timeout ?? 5000, 3000) },
      ),
    );

    const { category, confidence } = (response as any).data as {
      category: string;
      confidence: number;
    };

    if (!category || confidence < 0.5) return null;

    const result: CategorizationResult = {
      categoryId:   await this.getCategoryId(category),
      categoryName: category,
      confidence,
      source:       'ml',
    };

    await this.cache.set(cacheKey, result, 86400); // Cache 24h
    return result;
  }

  // ─── Get or create category by name ──────────────────────────────────────

  private async getCategoryId(name: string): Promise<string | null> {
    if (this.categoryCache.has(name)) return this.categoryCache.get(name)!;

    const category = await this.categoryRepo.findOne({ where: { name } });
    if (category) {
      this.categoryCache.set(name, category.id);
      return category.id;
    }
    return null;
  }
}
