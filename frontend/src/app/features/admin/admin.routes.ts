import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'registrations',
    loadComponent: () => import('./registrations/registrations.component').then(m => m.RegistrationsComponent)
  },
  {
    path: 'cabins',
    loadComponent: () => import('./cabins-overview/cabins-overview.component').then(m => m.CabinsOverviewComponent)
  }
];