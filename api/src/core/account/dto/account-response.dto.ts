import { ApiProperty } from '@nestjs/swagger';

import { AccountEntity, AccountStatus } from '../data';

export class AccountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: AccountStatus })
  status!: AccountStatus;

  @ApiProperty({ nullable: true })
  anonymizedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  version!: number;

  static fromEntity(account: AccountEntity): AccountResponseDto {
    // on renvoie juste les infos utile du compte
    return {
      id: account.id,
      status: account.status,
      anonymizedAt: account.anonymizedAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      version: account.version,
    };
  }
}
