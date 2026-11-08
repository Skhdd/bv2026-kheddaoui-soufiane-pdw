import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BasePersistenceEntity, ULID_LENGTH } from '@common/database';

import { AuthSessionEntity } from './auth-session.entity';

@Entity({ name: 'auth_refresh_token' })
@Index('uq_auth_refresh_token_hash', ['tokenHash'], {
  unique: true,
})
@Index('uq_auth_refresh_token_parent_id', ['parentId'], {
  unique: true,
})
@Index('idx_auth_refresh_token_session_id', ['sessionId'])
export class AuthRefreshTokenEntity extends BasePersistenceEntity {
  // session lié au token
  @Column({
    name: 'session_id',
    type: 'varchar',
    length: ULID_LENGTH,
  })
  sessionId!: string;

  @ManyToOne(() => AuthSessionEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'session_id',
    referencedColumnName: 'id',
  })
  session!: AuthSessionEntity;

  // on garde que l'empreinte du token
  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 64,
  })
  tokenHash!: string;

  // ancien token de la chaine
  @Column({
    name: 'parent_id',
    type: 'varchar',
    length: ULID_LENGTH,
    nullable: true,
  })
  parentId!: string | null;

  @ManyToOne(() => AuthRefreshTokenEntity, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'id',
  })
  parent!: AuthRefreshTokenEntity | null;

  // nouveau token qui remplace l'ancien
  @Column({
    name: 'replaced_by_id',
    type: 'varchar',
    length: ULID_LENGTH,
    nullable: true,
  })
  replacedById!: string | null;

  // expiration du token
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  // date ou le token a été utilisé
  @Column({
    name: 'consumed_at',
    type: 'timestamptz',
    nullable: true,
  })
  consumedAt!: Date | null;

  // date de révocation
  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;
}
