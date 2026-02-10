import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Reservation } from '../../../../models/reservation.model';
import { OwnerService } from '../../../../services/owner.service';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheck, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    FontAwesomeModule
  ],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})

export class ReservationDialogComponent {
  rejectForm: FormGroup;
  showRejectForm = false;

  faCheck = faCheck;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;

  constructor(
    private fb: FormBuilder,
    private ownerService: OwnerService,
    private dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: Reservation },
    private snackBar: MatSnackBar,
    private faIconLibrary: FaIconLibrary
  ) {
    this.faIconLibrary.addIcons(faCheck, faTimes, faPaperPlane);
    this.rejectForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  getNightsCount(): number {
    const start = new Date(this.data.reservation.startDate);
    const end = new Date(this.data.reservation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusText(): string {
    switch (this.data.reservation.status) {
      case 'PENDING': return 'Na čekanju';
      case 'ACCEPTED': return 'Prihvaćena';
      case 'REJECTED': return 'Odbijena';
      case 'CANCELLED': return 'Otkazana';
      default: return this.data.reservation.status;
    }
  }

  getStatusColor(): string {
    switch (this.data.reservation.status) {
      case 'PENDING': return 'accent';
      case 'ACCEPTED': return 'primary';
      case 'REJECTED': return 'warn';
      case 'CANCELLED': return 'warn';
      default: return '';
    }
  }

  acceptReservation(): void {
    this.ownerService.acceptReservation(this.data.reservation.id).subscribe({
      next: () => {
        this.snackBar.open('Rezervacija je prihvaćena', 'Zatvori', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        console.error('Greška pri prihvatanju rezervacije:', error);
        const errorMessage = error?.error || error?.message || 'Greška pri prihvatanju rezervacije';
        this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
      }
    });
  }

  rejectReservation(): void {
    if (this.rejectForm.valid) {
      const comment = this.rejectForm.value.comment;
      this.ownerService.rejectReservation(this.data.reservation.id, comment).subscribe({
        next: () => {
          this.snackBar.open('Rezervacija je odbijena', 'Zatvori', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Greška pri odbijanju rezervacije:', error);
          const errorMessage = error?.error || error?.message || 'Greška pri odbijanju rezervacije';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }
}
