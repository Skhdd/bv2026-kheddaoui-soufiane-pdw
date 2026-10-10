import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ParseUlidPipe } from '@common/database';

import { AccountService } from './account.service';
import { AccountResponseDto } from './dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un compte' })
  @ApiCreatedResponse({
    description: 'compte créé',
    type: AccountResponseDto,
  })
  async create(): Promise<AccountResponseDto> {
    // création du compte en base

    const account = await this.accountService.create();

    return AccountResponseDto.fromEntity(account);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un compte' })
  @ApiParam({
    name: 'id',
    description: 'identifiant ulid du compte',
  })
  @ApiOkResponse({
    description: 'compte trouvé',
    type: AccountResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'identifiant invalide',
  })
  @ApiNotFoundResponse({
    description: 'compte introuvable',
  })
  async findOne(
    @Param('id', ParseUlidPipe) id: string,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.findById(id);

    return AccountResponseDto.fromEntity(account);
  }
}
