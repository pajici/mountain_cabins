import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(query?: string): Observable<User[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }
    params = params.set('_t', Date.now().toString());
    return this.http.get<User[]>('/api/admin/users', { params });
  }

  createUser(user: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>('/api/admin/users', user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/admin/users/${id}`, user);
  }

  activateUser(id: number): Observable<any> {
    return this.http.patch(`/api/admin/users/${id}/activate`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.patch(`/api/admin/users/${id}/deactivate`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  changeUserRole(id: number, role: string): Observable<any> {
    return this.http.patch(`/api/admin/users/${id}/change-role`, { role });
  }

  getPendingRegistrations(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/registrations');
  }

  approveRegistration(id: number): Observable<any> {
    return this.http.post(`/api/admin/registrations/${id}/approve`, {});
  }

  rejectRegistration(id: number, reason?: string): Observable<any> {
    const body = reason ? { reason } : {};
    return this.http.post(`/api/admin/registrations/${id}/reject`, body);
  }

  getAllCabins(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/cabins');
  }

  blockCabin(id: number): Observable<any> {
    return this.http.post(`/api/admin/cabins/${id}/block-48h`, {});
  }

  unblockCabin(id: number): Observable<any> {
    return this.http.post(`/api/admin/cabins/${id}/unblock`, {});
  }

  getKpi(): Observable<any> {
    return this.http.get('/api/admin/kpi');
  }
}