import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, UseInterceptors, UploadedFile,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto,
} from './dto/transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly svc: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.svc.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters & pagination' })
  findAll(@CurrentUser() user: User, @Query() query: TransactionQueryDto) {
    return this.svc.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction (or correct its category)' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.svc.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.remove(user.id, id);
  }

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk upload transactions via CSV' })
  bulkUpload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('No file uploaded');
    return this.svc.bulkUploadCsv(user.id, file.buffer);
  }

  @Post('parse-sms')
  @ApiOperation({ summary: 'Parse an Indian bank SMS and create transaction' })
  parseSms(
    @CurrentUser() user: User,
    @Body('sms') smsText: string,
  ) {
    return this.svc.parseSms(user.id, smsText);
  }
}
