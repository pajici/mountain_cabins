import { Routes } from '@angular/router';

export const touristRoutes: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadComponent: () => import('./tourist-profile/tourist-profile.component').then(m => m.TouristProfileComponent)
  },
  {
    path: 'reservations',
    loadComponent: () => import('./reservations/reservations.component').then(m => m.ReservationsComponent)
  },
  {
    path: 'booking',
    loadComponent: () => import('./booking/booking.component').then(m => m.BookingComponent)
  }
];