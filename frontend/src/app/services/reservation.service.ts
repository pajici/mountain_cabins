import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(private http: HttpClient) {}

  getCurrentReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/tourist/reservations/current');
  }

  getArchiveReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/tourist/reservations/archive');
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete(`/api/tourist/reservations/${id}`);
  }

  createReservation(reservation: Partial<Reservation>): Observable<any> {
    return this.http.post('/api/tourist/reservations', reservation);
  }

  createReview(reservationId: number, rating: number, comment: string): Observable<any> {
    return this.http.post('/api/tourist/reviews', { reservationId, rating, comment });
  }

  getLastUsedCard(): Observable<{cardType: string, cardLast4: string}> {
    return this.http.get<{cardType: string, cardLast4: string}>('/api/tourist/last-used-card');
  }
}