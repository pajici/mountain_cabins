import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';
import { ReviewDialogComponent } from '../../../shared/components/review-dialog/review-dialog.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faCalendarAlt, faHistory, faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    FontAwesomeModule
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  currentReservations: Reservation[] = [];
  archiveReservations: Reservation[] = [];
  archiveLoaded = false;

  faTimes = faTimes;
  faCalendarAlt = faCalendarAlt;
  faHistory = faHistory;
  faStar = faStar;

  constructor(
    private reservationService: ReservationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private library: FaIconLibrary
  ) {
    library.addIcons(faTimes, faCalendarAlt, faHistory, faStar);
  }

  ngOnInit(): void {
    this.loadCurrentReservations();
  }

  onTabChange(event: any): void {
    if (event.index === 1) {
      this.loadArchiveReservations();
    }
  }

  loadCurrentReservations(): void {
    this.reservationService.getCurrentReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.currentReservations = reservations;
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju rezervacija:', error);
        this.snackBar.open('Greška pri učitavanju rezervacija', 'Zatvori', { duration: 3000 });
      }
    });
  }

  loadArchiveReservations(): void {
    if (this.archiveLoaded) return;
    this.reservationService.getArchiveReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.archiveReservations = reservations;
        this.archiveLoaded = true;
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju arhiviranih rezervacija:', error);
        this.snackBar.open('Greška pri učitavanju arhiviranih rezervacija', 'Zatvori', { duration: 3000 });
      }
    });
  }

  canCancel(reservation: Reservation): boolean {
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const timeDiff = startDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    return (reservation.status === 'ACCEPTED' || reservation.status === 'PENDING') && daysDiff >= 1;
  }

  cancelReservation(reservation: Reservation): void {
    if (confirm('Da li ste sigurni da želite da otkažete ovu rezervaciju?')) {
      this.reservationService.cancelReservation(reservation.id).subscribe({
        next: () => {
          this.snackBar.open('Rezervacija je uspešno otkazana', 'Zatvori', { duration: 3000 });
          this.loadCurrentReservations();
        },
        error: (error) => {
          console.error('Greška pri otkazivanju rezervacije:', error);
          const errorMessage = error?.error || 'Greška pri otkazivanju rezervacije';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  canReview(reservation: Reservation): boolean {
    return reservation.status === 'ACCEPTED' && 
           new Date(reservation.endDate) < new Date() &&
           !reservation.isReviewed;
  }

  leaveReview(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '600px',
      data: { reservation },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.createReview(result.reservationId, result.rating, result.comment).subscribe({
          next: () => {
            this.snackBar.open('Recenzija je uspešno sačuvana', 'Zatvori', { duration: 3000 });
            this.archiveLoaded = false;
            this.loadArchiveReservations();
          },
          error: (error) => {
            console.error('Greška pri čuvanju recenzije:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error body:', error.error);
            let errorMessage = 'Greška pri čuvanju recenzije';
            
            if (error.error) {
              if (typeof error.error === 'string') {
                if (error.error.includes('Already reviewed')) {
                  errorMessage = 'Već ste ostavili recenziju za ovu rezervaciju';
                } else if (error.error.includes('Can only review accepted')) {
                  errorMessage = 'Možete recenzirati samo prihvaćene rezervacije';
                } else if (error.error.includes('Cannot review before stay ends')) {
                  errorMessage = 'Možete recenzirati tek nakon završetka boravka';
                } else {
                  errorMessage = error.error;
                }
              }
            }
            
            this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
          }
        });
      }
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'Prihvaćena';
      case 'PENDING': return 'Na čekanju';
      case 'REJECTED': return 'Odbijena';
      case 'CANCELLED': return 'Otkazana';
      default: return status;
    }
  }
}