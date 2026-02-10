import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';
import { EditUserDialogComponent } from './edit-user-dialog.component';

@Component({
  selector: 'app-user-management',
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
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  dataSource: User[] = []; // Reactive datasource za mat-table
  displayedColumns: string[] = ['username', 'name', 'email', 'role', 'status', 'actions'];

  pageSize = 10;
  currentPage = 0;
  sortField = 'username';
  sortDirection: 'asc' | 'desc' = 'asc';

  searchControl = new FormControl('');
  roleControl = new FormControl('');
  statusControl = new FormControl('');

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.roleControl.valueChanges.subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users
          .filter(user => user.role !== 'ADMIN')
          .map(user => JSON.parse(JSON.stringify(user)));
        this.applyFilters();
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju korisnika:', error);
        this.snackBar.open('Greška pri učitavanju korisnika', 'Zatvori', { duration: 3000 });
      }
    });
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.users];

    const searchValue = this.searchControl.value?.toLowerCase();
    if (searchValue) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchValue) ||
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      );
    }

    const roleValue = this.roleControl.value;
    if (roleValue) {
      filtered = filtered.filter(user => user.role === roleValue);
    }

    const statusValue = this.statusControl.value;
    if (statusValue !== '') {
      const isActive = statusValue === 'true';
      filtered = filtered.filter(user => user.active === isActive);
    }

    filtered.sort((a, b) => {
      const aValue = (a as any)[this.sortField];
      const bValue = (b as any)[this.sortField];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredUsers = filtered;
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
    this.paginatedUsers = this.filteredUsers
      .slice(startIndex, endIndex)
      .map(user => JSON.parse(JSON.stringify(user)));
    this.dataSource = [...this.paginatedUsers];
    this.cdr.detectChanges();
  }

  editUser(user: User): void {
    const userCopy = JSON.parse(JSON.stringify(user));
    
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '800px',
      data: { user: userCopy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.users = [];
        this.filteredUsers = [];
        this.paginatedUsers = [];
        this.dataSource = [];
        
        setTimeout(() => {
          this.loadUsers();
        }, 100);
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.active ? 'deaktivirati' : 'aktivirati';
    if (confirm(`Da li ste sigurni da želite da ${action} korisnika "${user.username}"?`)) {
      const operation = user.active
        ? this.adminService.deactivateUser(user.id)
        : this.adminService.activateUser(user.id);

      operation.subscribe({
        next: () => {
          this.snackBar.open(`Korisnik je ${user.active ? 'deaktiviran' : 'aktivirani'}`, 'Zatvori', { duration: 3000 });
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Greška pri promeni statusa korisnika:', error);
          this.snackBar.open('Greška pri promeni statusa korisnika', 'Zatvori', { duration: 3000 });
        }
      });
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'OWNER': return 'Vlasnik';
      case 'TOURIST': return 'Turista';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'OWNER': return 'primary';
      case 'TOURIST': return 'accent';
      default: return 'basic';
    }
  }
}
