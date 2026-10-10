import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { createUlid, ULID_LENGTH } from '../identifier/ulid.util';

export abstract class BasePersistenceEntity {
  // id unique génerer par l'app
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
    length: ULID_LENGTH,
  })
  id!: string;

  // date de création
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  // date de derniere modif
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  // sert a suivre les modification
  @VersionColumn({
    name: 'version',
    type: 'integer',
    default: 1,
  })
  version!: number;

  @BeforeInsert()
  protected ensureApplicationGeneratedId(): void {
    // si y a pas encore d'id on en crée un
    if (!this.id) {
      this.id = createUlid();
    }
  }
}
