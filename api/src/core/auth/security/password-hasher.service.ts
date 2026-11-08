import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHasherService {
  // on hash le mot de passe avec argon2id
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  // on verifie si le mot de passe correspond au hash
  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
