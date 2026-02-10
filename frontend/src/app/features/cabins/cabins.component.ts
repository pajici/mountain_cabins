import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CabinService } from '../../services/index';
import { AuthService } from '../../services/index';
import { Cabin } from '../../models/cabin.model';

@Component({
  selector: 'app-cabins',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cabins.component.html',
  styleUrls: ['./cabins.component.scss']
})
export class CabinsComponent implements OnInit {
  cabins: {cabin: Cabin, averageRating: number, thumbnail: number | null}[] = [];
  stats = { confirmedReservations24h: 0, confirmedReservations7d: 0, confirmedReservations30d: 0, totalCabins: 0, totalOwners: 0, totalTourists: 0 };
  totalCabins = 0;
  totalOwners = 0;
  totalTourists = 0;
  offset = 0;
  limit = 20;
  hasMore = true;
  searchQuery = '';
  sortBy = '';

  constructor(public cabinService: CabinService, public authService: AuthService) {}

  ngOnInit() {
    this.loadStats();
    this.loadCabins();
  }

  loadStats() {
    this.cabinService.getPublicStats().subscribe({
      next: (stats: {confirmedReservations24h: number, confirmedReservations7d: number, confirmedReservations30d: number, totalCabins: number, totalOwners: number, totalTourists: number}) => {
        this.stats = stats;
        this.totalCabins = stats.totalCabins;
        this.totalOwners = stats.totalOwners;
        this.totalTourists = stats.totalTourists;
      }
    });
  }

  loadCabins() {
    this.cabinService.getCabins(this.searchQuery, this.offset, this.limit).subscribe({
      next: (cabins: {cabin: Cabin, averageRating: number, thumbnail: number | null}[]) => {
        if (this.offset === 0) {
          this.cabins = cabins;
        } else {
          this.cabins = [...this.cabins, ...cabins];
        }
        this.hasMore = cabins.length === this.limit;
      },
      error: (err) => {
        console.error('❌ Greška pri učitavanju vikendica:', err);
      }
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.offset = 0;
    this.loadCabins();
  }

  onSort(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.sortCabins();
  }

  sortCabins() {
    if (!this.sortBy) return;
    this.cabins.sort((a, b) => {
      let aVal: string, bVal: string;
      switch (this.sortBy) {
        case 'name_asc': aVal = a.cabin.name; bVal = b.cabin.name; return aVal.localeCompare(bVal);
        case 'name_desc': aVal = a.cabin.name; bVal = b.cabin.name; return bVal.localeCompare(aVal);
        case 'place_asc': aVal = a.cabin.place; bVal = b.cabin.place; return aVal.localeCompare(bVal);
        case 'place_desc': aVal = a.cabin.place; bVal = b.cabin.place; return bVal.localeCompare(aVal);
        default: return 0;
      }
    });
  }

  loadMore() {
    this.offset += this.limit;
    this.loadCabins();
  }

  getCabinImage(thumbnail: number | null): string {
    if (thumbnail) {
      return `/api/public/images/${thumbnail}`;
    }
    return '/assets/placeholder-cabin.svg';
  }

  getStars(rating: number): {filled: boolean, half: boolean}[] {
    const stars: {filled: boolean, half: boolean}[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push({filled: true, half: false});
      } else if (i === fullStars && hasHalfStar) {
        stars.push({filled: false, half: true});
      } else {
        stars.push({filled: false, half: false});
      }
    }
    return stars;
  }
}