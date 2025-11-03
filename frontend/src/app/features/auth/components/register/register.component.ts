import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmailVerificationService } from '../../services/email-verification.service';
import { CustomValidators } from '../../../../shared/utils/validators';
import { RegisterRequest } from '../../../../core/models/auth.models';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly emailVerificationService = inject(EmailVerificationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  registerForm!: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;

  // Dialog properties
  verificationDialogVisible = false;
  verificationCode = '';
  verifying = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        CustomValidators.strongPassword()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: CustomValidators.passwordMatch() });
  }

  get f() { return this.registerForm.controls; }

  get isFormValid(): boolean {
    return this.registerForm?.valid ?? false;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.handleRegistration();
  }

  private handleRegistration() {
    const { confirmPassword, ...registerData } = this.registerForm.value;
    const request: RegisterRequest = registerData;

    this.authService.register(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.registerForm.reset();
        this.verificationDialogVisible = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: response.message || 'Un code de vérification a été envoyé à votre adresse email.'
        });
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message || 'Erreur lors de l\'inscription';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.error || 'Erreur lors de l\'inscription'
        });
      }
    });
  }

  verifyCode() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez entrer un code de vérification valide (6 chiffres).'
      });
      return;
    }

    this.verifying = true;
    this.emailVerificationService.verifyEmail(this.verificationCode).subscribe({
      next: (response) => {
        this.verifying = false;
        this.verificationDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Compte créé avec succès !',
          detail: 'Votre email a été vérifié. Vous pouvez maintenant vous connecter.'
        });
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 5000);
      },
      error: (error) => {
        this.verifying = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error?.error?.message || 'Code de vérification invalide.'
        });
      }
    });
  }

  closeDialog() {
    this.verificationDialogVisible = false;
    this.verificationCode = '';
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
