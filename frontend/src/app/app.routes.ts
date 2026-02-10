import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/cabins', pathMatch: 'full' },
  { path: 'cabins', loadComponent: () => import('./features/cabins/cabins.component').then(m => m.CabinsComponent) },
  { path: 'cabins/:id', loadComponent: () => import('./features/cabin-detail/cabin-detail.component').then(m => m.CabinDetailComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'admin/login', loadComponent: () => import('./features/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'change-password', loadComponent: () => import('./features/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'tourist', loadChildren: () => import('./features/tourist/tourist.routes').then(m => m.touristRoutes) },
  { path: 'owner', loadChildren: () => import('./features/owner/owner.routes').then(m => m.ownerRoutes) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes) },
  { path: '**', redirectTo: '/cabins' }
];