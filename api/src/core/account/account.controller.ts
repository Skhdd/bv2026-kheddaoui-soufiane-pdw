import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ParseUlidPipe } from '@common/database';

import { AccountService } from './account.service';
import { AccountResponseDto } from './dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un compte' })
  async create(): Promise<AccountResponseDto> {
    // création en base puis conversion en dto
    const account = await this.accountService.create();

    return AccountResponseDto.fromEntity(account);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un compte' })
  async findOne(
    @Param('id', ParseUlidPipe) id: string,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.findById(id);

    return AccountResponseDto.fromEntity(account);
  }
}
