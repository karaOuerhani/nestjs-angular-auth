import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const token = this.authService.getToken();

    if (isLoggedIn) {
      return true;
    }

    try {
      const result = this.router.navigate(['/auth/login']);
      console.log('Router navigate result:', result);
      return false;
    } catch (error) {
      console.error('Router navigate error:', error);
      return false;
    }
  }
}