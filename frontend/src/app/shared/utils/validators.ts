import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const isValidLength = value.length >= 8;

      // Pour l'instant, rendons la validation moins stricte
      // On garde seulement la longueur minimale et au moins une majuscule/minuscule/chiffre
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isValidLength;

      return !passwordValid ? {
        strong: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          isValidLength,
          message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
        }
      } : null;
    };
  }

  static passwordMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (!password || !confirmPassword) return null;

      return password.value !== confirmPassword.value ? { mismatch: true } : null;
    };
  }

  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasWhitespace = /\s/.test(value);
      return hasWhitespace ? { whitespace: true } : null;
    };
  }
}