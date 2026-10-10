import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiCodeResponse, ApiException } from '@common/api';

import { AccountEntity } from './data';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(): Promise<AccountEntity> {
    // création du compte avant de l'enregistrer
    const account = this.accountRepository.create();

    return this.accountRepository.save(account);
  }

  async findById(id: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    // si le compte existe pas on renvoie une 404
    if (!account) {
      throw new ApiException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ApiCodeResponse.AccountNotFound,
        logMessage: 'account not found',
      });
    }

    return account;
  }
}
