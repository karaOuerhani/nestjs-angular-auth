import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      return strongRegex.test(value) ? null : { strong: true };
    };
  }
  
  static passwordMatch(passwordKey = 'password', confirmPasswordKey = 'confirmPassword'): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey)?.value;
      const confirmPassword = group.get(confirmPasswordKey)?.value;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }
}
