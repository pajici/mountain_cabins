import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faCheckCircle, faTimes, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../../services/admin.service';
import { RegistrationRequest } from '../../../models/registration-request.model';
import { RegistrationDetailsDialogComponent } from './registration-details-dialog.component';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FontAwesomeModule
  ],
  templateUrl: './registrations.component.html',
  styleUrls: ['./registrations.component.scss']
})
export class RegistrationsComponent implements OnInit {
  faEye = faEye;
  faCheckCircle = faCheckCircle;
  faTimes = faTimes;
  faUserCheck = faUserCheck;

  registrations: RegistrationRequest[] = [];
  filteredRegistrations: RegistrationRequest[] = [];
  paginatedRegistrations: RegistrationRequest[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];

  pageSize = 10;
  currentPage = 0;
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private library: FaIconLibrary
  ) {
    library.addIcons(faEye, faCheckCircle, faTimes, faUserCheck);
  }

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.adminService.getPendingRegistrations().subscribe({
      next: (registrations: RegistrationRequest[]) => {
        this.registrations = registrations;
        this.updateStats();
        this.applyFiltersAndSort();
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju registracija:', error);
        this.snackBar.open('Greška pri učitavanju registracija', 'Zatvori', { duration: 3000 });
      }
    });
  }

  updateStats(): void {
    this.pendingCount = this.registrations.filter(r => r.status === 'PENDING').length;
    this.approvedCount = this.registrations.filter(r => r.status === 'APPROVED').length;
    this.rejectedCount = this.registrations.filter(r => r.status === 'REJECTED').length;
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    this.filteredRegistrations = [...this.registrations].sort((a, b) => {
      const aValue = (a as any)[this.sortField];
      const bValue = (b as any)[this.sortField];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePaginatedData();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
  }

  viewDetails(registration: RegistrationRequest): void {
    const dialogRef = this.dialog.open(RegistrationDetailsDialogComponent, {
      width: '800px',
      data: registration
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'approve') {
          this.approveRegistration(result.registration);
        } else if (result.action === 'reject') {
          this.rejectRegistration(result.registration);
        }
      }
    });
  }

  approveRegistration(registration: RegistrationRequest): void {
    if (confirm(`Da li ste sigurni da želite da odobrite registraciju za ${registration.firstName} ${registration.lastName}?`)) {
      this.adminService.approveRegistration(registration.id).subscribe({
        next: () => {
          this.snackBar.open('Registracija je uspešno odobrena', 'Zatvori', { duration: 3000 });
          this.loadRegistrations();
        },
        error: (error: any) => {
          console.error('Greška pri odobravanju registracije:', error);
          const errorMessage = error.error && typeof error.error === 'string' 
            ? error.error 
            : 'Greška pri odobravanju registracije';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  rejectRegistration(registration: RegistrationRequest): void {
    const reason = prompt('Unesite razlog odbijanja (opcionalno):');
    if (reason !== null) {
      this.adminService.rejectRegistration(registration.id, reason).subscribe({
        next: () => {
          this.snackBar.open('Registracija je odbijena', 'Zatvori', { duration: 3000 });
          this.loadRegistrations();
        },
        error: (error: any) => {
          console.error('Greška pri odbijanju registracije:', error);
          const errorMessage = error.error && typeof error.error === 'string' 
            ? error.error 
            : 'Greška pri odbijanju registracije';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'OWNER': return 'Vlasnik';
      case 'TOURIST': return 'Turista';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'OWNER': return 'accent';
      case 'TOURIST': return 'primary';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Na čekanju';
      case 'APPROVED': return 'Odobrena';
      case 'REJECTED': return 'Odbijena';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'basic';
      case 'APPROVED': return 'primary';
      case 'REJECTED': return 'warn';
      default: return 'basic';
    }
  }
}