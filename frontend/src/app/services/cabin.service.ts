import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cabin } from '../models/cabin.model';

@Injectable({
  providedIn: 'root'
})
export class CabinService {
  constructor(private http: HttpClient) {}

  getCabins(query?: string, offset: number = 0, limit: number = 20): Observable<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    if (query) {
      params = params.set('q', query);
    }
    return this.http.get<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]>('/api/public/cabins', { params });
  }

  getPublicStats(): Observable<{confirmedReservations24h: number, confirmedReservations7d: number, confirmedReservations30d: number, totalCabins: number, totalOwners: number, totalTourists: number}> {
    return this.http.get<{confirmedReservations24h: number, confirmedReservations7d: number, confirmedReservations30d: number, totalCabins: number, totalOwners: number, totalTourists: number}>('/api/public/kpi');
  }
}