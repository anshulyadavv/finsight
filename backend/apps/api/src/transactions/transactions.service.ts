import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { parse as csvParse } from 'csv-parse/sync';
import { Transaction, TransactionType, PaymentMethod } from './transaction.entity';
import {
  CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto,
} from './dto/transaction.dto';
import { CategorizationService } from '../categorization/categorization.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
    @InjectQueue('insights') private readonly insightsQueue: Queue,
    @InjectQueue('anomalies') private readonly anomaliesQueue: Queue,
    private readonly categorizationService: CategorizationService,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    let categoryId = dto.categoryId;
    let source = 'user';

    // Auto-categorize if no category given
    if (!categoryId && (dto.merchant || dto.description)) {
      const result = await this.categorizationService.categorize(
        dto.merchant || dto.description || '',
      );
      categoryId = result?.categoryId ?? undefined;
      source = result?.source || 'rule';
    }

    const tx = this.repo.create({
      userId,
      amount: dto.amount,
      merchant: dto.merchant,
      description: dto.description,
      type: dto.type,
      date: new Date(dto.date),
      paymentMethod: dto.paymentMethod || PaymentMethod.OTHER,
      categoryId,
      isRecurring: dto.isRecurring || false,
      smsRaw: dto.smsRaw,
      categorizationSource: source,
    });

    const saved = await this.repo.save(tx);

    // Queue background jobs
    await this.insightsQueue.add('generate', { userId }, { delay: 5000 });
    await this.anomaliesQueue.add('detect', { userId, transactionId: saved.id });

    return saved;
  }

  // ─── FIND ALL (paginated, filtered) ──────────────────────────────────────

  async findAll(userId: string, query: TransactionQueryDto) {
    const qb: SelectQueryBuilder<Transaction> = this.repo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.category', 'category')
      .where('tx.userId = :userId', { userId });

    if (query.month) {
      const [year, month] = query.month.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      qb.andWhere('tx.date BETWEEN :start AND :end', { start, end });
    }

    if (query.type)       qb.andWhere('tx.type = :type', { type: query.type });
    if (query.categoryId) qb.andWhere('tx.categoryId = :cat', { cat: query.categoryId });
    if (query.search) {
      qb.andWhere(
        '(tx.merchant ILIKE :search OR tx.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const total = await qb.getCount();
    const page  = query.page  || 1;
    const limit = query.limit || 20;

    qb.orderBy(`tx.${query.sortBy || 'date'}`, query.sortOrder || 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await qb.getMany();

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────

  async findOne(userId: string, id: string): Promise<Transaction> {
    const tx = await this.repo.findOne({
      where: { id, userId },
      relations: ['category'],
    });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const tx = await this.findOne(userId, id);

    // If user manually sets category, mark as user-corrected
    if (dto.categoryId && dto.categoryId !== tx.categoryId) {
      Object.assign(tx, dto, {
        categoryId: dto.categoryId,
        categorizationSource: 'user',
        categorizationConfidence: 1.0,
      });
      // Feed correction back to ML
      await this.insightsQueue.add('train', {
        description: tx.merchant || tx.description,
        categoryId: dto.categoryId,
      });
    } else {
      Object.assign(tx, dto);
    }

    if (dto.date) tx.date = new Date(dto.date);
    return this.repo.save(tx);
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────

  async remove(userId: string, id: string): Promise<void> {
    const tx = await this.findOne(userId, id);
    await this.repo.remove(tx);
    await this.insightsQueue.add('generate', { userId }, { delay: 2000 });
  }

  // ─── BULK CSV UPLOAD ──────────────────────────────────────────────────────

  async bulkUploadCsv(userId: string, fileBuffer: Buffer): Promise<{
    created: number; failed: number; errors: string[];
  }> {
    let records: Record<string, string>[];
    try {
      records = csvParse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch {
      throw new BadRequestException('Invalid CSV format');
    }

    const results = { created: 0, failed: 0, errors: [] as string[] };

    for (const [i, row] of records.entries()) {
      try {
        const dto: CreateTransactionDto = {
          amount:      parseFloat(row.amount),
          merchant:    row.merchant || row.name,
          description: row.description || row.note,
          type:        this.parseType(row.type),
          date:        row.date,
          paymentMethod: this.parsePaymentMethod(row.payment_method),
        };

        if (isNaN(dto.amount)) throw new Error('Invalid amount');
        if (!dto.date)         throw new Error('Missing date');

        await this.create(userId, dto);
        results.created++;
      } catch (e) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${(e as Error).message}`);
      }
    }

    this.logger.log(`CSV import for ${userId}: ${results.created} created, ${results.failed} failed`);
    return results;
  }

  // ─── SMS PARSE ────────────────────────────────────────────────────────────

  async parseSms(userId: string, smsText: string): Promise<Transaction | null> {
    // Indian bank SMS patterns
    const patterns = [
      // HDFC: "INR 450.00 debited from A/c *1234 on 15-03-25 at SWIGGY"
      /(?:INR|Rs\.?)\s*([\d,]+\.?\d*)\s*(debited|credited|spent|received).*?(?:at|to|from)?\s*([A-Z][A-Z\s]+?)(?:\s|$)/i,
      // SBI: "Your a/c XXXX1234 is debited by Rs.500.00 on 15Mar25"
      /debited by\s*(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i,
      // Generic amount detection
      /(?:paid|spent|debited|charged)\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = smsText.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!amount) continue;

        const isCredit = /credited|received|deposited/i.test(smsText);
        const merchant = match[3]?.trim();

        return this.create(userId, {
          amount,
          merchant,
          type:   isCredit ? TransactionType.INCOME : TransactionType.EXPENSE,
          date:   new Date().toISOString().split('T')[0],
          smsRaw: smsText,
        });
      }
    }

    this.logger.warn(`Could not parse SMS for user ${userId}: ${smsText.slice(0, 80)}`);
    return null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private parseType(raw: string): TransactionType {
    const v = (raw || '').toLowerCase();
    if (v === 'income' || v === 'credit') return TransactionType.INCOME;
    if (v === 'transfer')                 return TransactionType.TRANSFER;
    return TransactionType.EXPENSE;
  }

  private parsePaymentMethod(raw: string): PaymentMethod {
    const v = (raw || '').toLowerCase();
    if (v.includes('upi'))   return PaymentMethod.UPI;
    if (v.includes('card'))  return PaymentMethod.CARD;
    if (v.includes('net') || v.includes('neft') || v.includes('imps'))
                             return PaymentMethod.NETBANKING;
    if (v.includes('cash'))  return PaymentMethod.CASH;
    return PaymentMethod.OTHER;
  }
}
