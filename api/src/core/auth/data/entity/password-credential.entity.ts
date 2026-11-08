import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BasePersistenceEntity, ULID_LENGTH } from '@common/database';
import { AccountEntity } from '@core/account/data';

@Entity({ name: 'password_credential' })
export class PasswordCredentialEntity extends BasePersistenceEntity {
  @Column({
    name: 'account_id',
    type: 'varchar',
    length: ULID_LENGTH,
  })
  accountId!: string;

  @OneToOne(() => AccountEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'id',
  })
  account!: AccountEntity;

  // on garde uniquement le hash du mot de passe
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash!: string;

  @Column({
    name: 'hash_version',
    type: 'integer',
    default: 1,
  })
  hashVersion!: number;

  // nombre de tentative raté
  @Column({
    name: 'failed_attempts',
    type: 'integer',
    default: 0,
  })
  failedAttempts!: number;

  @Column({
    name: 'locked_until',
    type: 'timestamptz',
    nullable: true,
  })
  lockedUntil!: Date | null;

  @Column({
    name: 'changed_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  changedAt!: Date;

  @Column({
    name: 'disabled_at',
    type: 'timestamptz',
    nullable: true,
  })
  disabledAt!: Date | null;

  @Column({
    name: 'last_used_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastUsedAt!: Date | null;
}
