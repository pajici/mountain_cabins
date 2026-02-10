import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cabin } from '../models/cabin.model';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  constructor(private http: HttpClient) {}

  getKpi(): Observable<{confirmedReservations24h: number, confirmedReservations7d: number, confirmedReservations30d: number}> {
    return this.http.get<{confirmedReservations24h: number, confirmedReservations7d: number, confirmedReservations30d: number}>('/api/public/kpi');
  }

  getCabins(query?: string, offset: number = 0, limit: number = 20): Observable<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]> {
    let params = `?offset=${offset}&limit=${limit}`;
    if (query) {
      params += `&q=${encodeURIComponent(query)}`;
    }
    return this.http.get<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]>(`/api/public/cabins${params}`);
  }

  getCabin(id: number): Observable<{cabin: Cabin, averageRating: number, reviews: Review[], images: number[]}> {
    return this.http.get<{cabin: Cabin, averageRating: number, reviews: Review[], images: number[]}>(`/api/public/cabins/${id}`);
  }

  getAvailableCabins(startDate: string, endDate: string, query?: string, offset: number = 0, limit: number = 20): Observable<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]> {
    let params = `?startDate=${startDate}&endDate=${endDate}&offset=${offset}&limit=${limit}`;
    if (query) {
      params += `&q=${encodeURIComponent(query)}`;
    }
    return this.http.get<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]>(`/api/public/cabins/available${params}`);
  }

  searchCabins(startDate: Date, endDate: Date, guestCount: number): Observable<{cabin: Cabin, averageRating: number, thumbnail: number | null}[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return this.getAvailableCabins(startDateStr, endDateStr);
  }
}