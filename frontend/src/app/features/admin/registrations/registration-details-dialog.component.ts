import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { RegistrationRequest } from '../../../models/registration-request.model';

@Component({
  selector: 'app-registration-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    FontAwesomeModule
  ],
  templateUrl: './registration-details-dialog.component.html',
  styleUrls: ['./registration-details-dialog.component.scss']
})
export class RegistrationDetailsDialogComponent {
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;

  constructor(
    private dialogRef: MatDialogRef<RegistrationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistrationRequest,
    private library: FaIconLibrary
  ) {
    library.addIcons(faTimes, faCheckCircle);
  }

  approve(): void {
    this.dialogRef.close({ action: 'approve', registration: this.data });
  }

  reject(): void {
    this.dialogRef.close({ action: 'reject', registration: this.data });
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