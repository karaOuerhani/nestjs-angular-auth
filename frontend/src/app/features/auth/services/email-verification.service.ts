import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class EmailVerificationService {
  private readonly http = inject(HttpClient);

  verifyEmail(code: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/users/verify-email`, { code });
  }
}