import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUsers, faHome, faCalendarCheck, faClock, faDollarSign, faCheckCircle, faUserCog, faUserCheck, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../../services/admin.service';

interface KPIData {
  totalUsers: number;
  totalCabins: number;
  totalReservations: number;
  pendingRegistrations: number;
  monthlyRevenue: number;
  activeCabins: number;
}

@Component({
  selector: 'app-admin-dashboard',
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
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  faUsers = faUsers;
  faHome = faHome;
  faCalendarCheck = faCalendarCheck;
  faClock = faClock;
  faDollarSign = faDollarSign;
  faCheckCircle = faCheckCircle;
  faUserCog = faUserCog;
  faUserCheck = faUserCheck;
  faBuilding = faBuilding;

  kpiData: KPIData = {
    totalUsers: 0,
    totalCabins: 0,
    totalReservations: 0,
    pendingRegistrations: 0,
    monthlyRevenue: 0,
    activeCabins: 0
  };

  constructor(private adminService: AdminService, private library: FaIconLibrary) {
    library.addIcons(faUsers, faHome, faCalendarCheck, faClock, faDollarSign, faCheckCircle, faUserCog, faUserCheck, faBuilding);
  }

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.adminService.getKpi().subscribe({
      next: (kpis: any) => {
        this.kpiData = kpis;
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju KPI-ja:', error);
        this.kpiData = {
          totalUsers: 245,
          totalCabins: 67,
          totalReservations: 189,
          pendingRegistrations: 12,
          monthlyRevenue: 1250000,
          activeCabins: 58
        };
      }
    });
  }
}