import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BasePersistenceEntity, ULID_LENGTH } from '@common/database';
import { AccountEntity } from '@core/account/data';

@Entity({ name: 'auth_session' })
@Index('idx_auth_session_account_id', ['accountId'])
export class AuthSessionEntity extends BasePersistenceEntity {
  // compte auquel appartient la session
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

  // version utilisé pour invalider les ancien token
  @Column({
    name: 'access_version',
    type: 'integer',
    default: 1,
  })
  accessVersion!: number;

  // on garde seulement l'empreinte du token csrf
  @Column({
    name: 'csrf_token_hash',
    type: 'varchar',
    length: 64,
  })
  csrfTokenHash!: string;

  // date d'expiration de la session
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  // date de révocation si la session est fermé
  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;
}
