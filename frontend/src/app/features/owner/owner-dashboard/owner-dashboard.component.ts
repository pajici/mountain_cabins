import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { OwnerService } from '../../../services/owner.service';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faHome, faCalendarCheck, faDollarSign, faStar, faUser, faCog, faCalendarAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  stats = {
    totalCabins: 0,
    activeReservations: 0,
    monthlyRevenue: 0,
    averageRating: 0
  };

  faHome = faHome;
  faCalendarCheck = faCalendarCheck;
  faDollarSign = faDollarSign;
  faStar = faStar;
  faUser = faUser;
  faCog = faCog;
  faCalendarAlt = faCalendarAlt;
  faChartLine = faChartLine;

  constructor(private ownerService: OwnerService, private faIconLibrary: FaIconLibrary) {
    this.faIconLibrary.addIcons(faHome, faCalendarCheck, faDollarSign, faStar, faUser, faCog, faCalendarAlt, faChartLine);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.ownerService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Greška pri učitavanju statistika:', error);
        this.stats = {
          totalCabins: 0,
          activeReservations: 0,
          monthlyRevenue: 0,
          averageRating: 0
        };
      }
    });
  }
}