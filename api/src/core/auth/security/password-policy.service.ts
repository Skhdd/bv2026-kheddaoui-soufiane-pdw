import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PasswordPolicyService {
  private readonly minLength = 15;
  private readonly maxLength = 128;

  validate(password: string): string[] {
    const errors: string[] = [];

    // on verifie la taille du mot de passe
    if (password.length < this.minLength) {
      errors.push('Le mot de passe doit contenir au moins 15 caracteres');
    }

    if (password.length > this.maxLength) {
      errors.push('Le mot de passe ne doit pas depasser 128 caracteres');
    }

    return errors;
  }

  assertValid(password: string): void {
    const errors = this.validate(password);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
