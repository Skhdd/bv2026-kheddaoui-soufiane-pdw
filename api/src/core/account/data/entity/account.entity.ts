import { Column, Entity } from 'typeorm';

import { BasePersistenceEntity } from '@common/database';

import { AccountStatus } from '../enum';

@Entity({ name: 'account' })
export class AccountEntity extends BasePersistenceEntity {
  // etat actuel du compte
  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.Active,
  })
  status!: AccountStatus;

  // date ou le compte a été anonyme
  @Column({
    name: 'anonymized_at',
    type: 'timestamptz',
    nullable: true,
  })
  anonymizedAt!: Date | null;
}
