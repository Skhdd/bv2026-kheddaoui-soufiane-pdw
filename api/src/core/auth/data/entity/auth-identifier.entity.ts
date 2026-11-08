import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BasePersistenceEntity, ULID_LENGTH } from '@common/database';
import { AccountEntity } from '@core/account/data';

import { AuthIdentifierType } from '../enum';

@Entity({ name: 'auth_identifier' })
@Index('uq_auth_identifier_type_value', ['type', 'value'], {
  unique: true,
})
@Index('idx_auth_identifier_account_id', ['accountId'])
export class AuthIdentifierEntity extends BasePersistenceEntity {
  // compte auquel appartient l'identifiant
  @Column({
    name: 'account_id',
    type: 'varchar',
    length: ULID_LENGTH,
  })
  accountId!: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'id',
  })
  account!: AccountEntity;

  // type d'identifiant utilisé
  @Column({
    name: 'type',
    type: 'enum',
    enum: AuthIdentifierType,
  })
  type!: AuthIdentifierType;

  // valeur de l'identifiant
  @Column({
    name: 'value',
    type: 'varchar',
    length: 320,
  })
  value!: string;

  @Column({
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt!: Date | null;

  @Column({
    name: 'is_primary',
    type: 'boolean',
    default: true,
  })
  isPrimary!: boolean;
}
