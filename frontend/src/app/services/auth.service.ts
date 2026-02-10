import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    return this.http.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  adminLogin(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    return this.http.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Admin-Login': 'true' }
    });
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {});
  }

  register(registrationData: FormData): Observable<any> {
    return this.http.post('/api/registrations', registrationData);
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post('/api/auth/password/change', { oldPassword, newPassword, confirmPassword });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put('/api/auth/profile', profileData);
  }

  updateProfileWithImage(formData: FormData): Observable<any> {
    return this.http.put('/api/auth/profile', formData);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>('/api/auth/profile');
  }

  checkAuthStatus(): void {
    this.http.get<User>('/api/auth/me').subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: () => {
        this.currentUserSubject.next(null);
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === role : false;
  }
}