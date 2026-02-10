import { Routes } from '@angular/router';

export const ownerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadComponent: () => import('./owner-profile/owner-profile.component').then(m => m.OwnerProfileComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent)
  },
  {
    path: 'cabins',
    loadComponent: () => import('./cabins-management/cabins-management.component').then(m => m.CabinsManagementComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/owner-calendar.component').then(m => m.OwnerCalendarComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics.component').then(m => m.StatisticsComponent)
  }
];