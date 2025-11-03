import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  EmailVerificationRequest,
  ApiResponse
} from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // State management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = this.getToken();
    if (token) {
    }
  }

  // Authentication methods
  register(data: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/users`, data);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  verifyEmail(code: string): Observable<ApiResponse> {
    const request: EmailVerificationRequest = { code };
    return this.http.post<ApiResponse>(`${environment.apiUrl}/users/verify-email`, request);
  }

  logout(): void {
    localStorage.removeItem('jwt');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  // State getters
  isLoggedIn(): boolean {
    const token = this.getToken();
    const result = !!token;
    console.log('AuthService.isLoggedIn():', { token: !!token, result });
    return result;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}