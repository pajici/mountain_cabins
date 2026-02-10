import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { OwnerService } from '../../../services/owner.service';
import { AuthService } from '../../../services/auth.service';
import { Reservation } from '../../../models/reservation.model';
import { Cabin } from '../../../models/cabin.model';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-owner-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FullCalendarModule,
    FontAwesomeModule
  ],
  templateUrl: './owner-calendar.component.html',
  styleUrls: ['./owner-calendar.component.scss']
})
export class OwnerCalendarComponent implements OnInit, OnDestroy {
  cabins: Cabin[] = [];
  reservations: Reservation[] = [];

  cabinControl = new FormControl('');

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    aspectRatio: 1.35,
    eventDisplay: 'block',
    dayMaxEvents: 3,
    moreLinkClick: 'popover'
  };

  private subscriptions: any[] = [];

  constructor(
    private ownerService: OwnerService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCabins();
    this.loadReservations();

    this.route.queryParams.subscribe(params => {
      if (params['cabinId']) {
        this.cabinControl.setValue(params['cabinId']);
      }
    });

    this.subscriptions.push(
      this.cabinControl.valueChanges.subscribe(() => this.updateCalendarEvents())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCabins(): void {
    this.ownerService.getMyCabins().subscribe({
      next: (cabins: Cabin[]) => {
        this.cabins = cabins;
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju vikendica:', error);
        this.snackBar.open('Greška pri učitavanju vikendica', 'Zatvori', { duration: 3000 });
      }
    });
  }

  loadReservations(): void {
    this.ownerService.getCalendar().subscribe({
      next: (reservations: any[]) => {
        this.reservations = reservations.map(r => ({
          id: r.id,
          cabinId: r.cabinId,
          touristId: r.touristId,
          startDate: r.startDate,
          endDate: r.endDate,
          adults: r.adults,
          children: r.children,
          status: r.status,
          ownerComment: r.ownerComment,
          touristNote: r.touristNote,
          totalPriceRsd: r.totalPriceRsd,
          cardType: r.cardType,
          cardLast4: r.cardLast4,
          createdAt: r.createdAt,
          cabinName: r.cabinName,
          touristName: r.touristName
        } as Reservation));
        this.updateCalendarEvents();
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju rezervacija:', error);
        this.snackBar.open('Greška pri učitavanju rezervacija', 'Zatvori', { duration: 3000 });
      }
    });
  }

  updateCalendarEvents(): void {
    const cabinId = this.cabinControl.value;
    let filteredReservations = this.reservations;

    if (cabinId) {
      filteredReservations = this.reservations.filter(r => r.cabinId === +cabinId);
    }

    const events: EventInput[] = filteredReservations.map(reservation => ({
      id: reservation.id.toString(),
      title: `${reservation.cabinName} - ${reservation.touristName}`,
      start: reservation.startDate,
      end: reservation.endDate,
      className: this.getEventClass(reservation.status),
      extendedProps: {
        reservation: reservation
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  handleEventClick(arg: EventClickArg): void {
    const reservation = arg.event.extendedProps['reservation'] as Reservation;
    this.showReservationDetails(reservation);
  }

  async showReservationDetails(reservation: Reservation): Promise<void> {
    const { ReservationDialogComponent } = await import('./reservation-dialog/reservation-dialog.component');
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '700px',
      data: { reservation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReservations();
      }
    });
  }

  getEventClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'confirmed';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'cancelled';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  }
}