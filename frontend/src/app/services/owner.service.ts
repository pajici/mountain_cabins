import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cabin } from '../models/cabin.model';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<{
    totalCabins: number,
    activeReservations: number,
    monthlyRevenue: number,
    averageRating: number
  }> {
    return this.http.get<{
      totalCabins: number,
      activeReservations: number,
      monthlyRevenue: number,
      averageRating: number
    }>('/api/owner/stats');
  }

  getMyCabins(): Observable<Cabin[]> {
    return this.http.get<Cabin[]>('/api/owner/cabins');
  }

  createCabin(cabin: Partial<Cabin>): Observable<Cabin> {
    return this.http.post<Cabin>('/api/owner/cabins', cabin);
  }

  updateCabin(id: number, cabin: Partial<Cabin>): Observable<Cabin> {
    return this.http.put<Cabin>(`/api/owner/cabins/${id}`, cabin);
  }

  deleteCabin(id: number): Observable<any> {
    return this.http.delete(`/api/owner/cabins/${id}`);
  }

  uploadCabinImages(cabinId: number, formData: FormData): Observable<any> {
    return this.http.post(`/api/owner/cabins/${cabinId}/images`, formData);
  }

  acceptReservation(id: number): Observable<any> {
    return this.http.post(`/api/owner/reservations/${id}/accept`, {});
  }

  rejectReservation(id: number, comment: string): Observable<any> {
    return this.http.post(`/api/owner/reservations/${id}/reject`, { comment });
  }

  getCalendar(): Observable<any[]> {
    return this.http.get<any[]>('/api/owner/calendar');
  }

  getMonthlyReservations(): Observable<any[]> {
    return this.http.get<any[]>('/api/owner/statistics/monthly-reservations');
  }

  getWeekendVsWeekday(): Observable<any[]> {
    return this.http.get<any[]>('/api/owner/statistics/weekend-vs-weekday');
  }
}