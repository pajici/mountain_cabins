import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PublicService } from '../../../services/public.service';
import { ReservationService } from '../../../services/reservation.service';
import { Cabin } from '../../../models/cabin.model';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch, faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    FontAwesomeModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  dateForm: FormGroup;
  paymentForm: FormGroup;
  availableCabins: {cabin: Cabin, averageRating: number, thumbnail: number | null}[] = [];
  selectedCabin: {cabin: Cabin, averageRating: number, thumbnail: number | null} | null = null;
  guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  directBookingCabinId: number | null = null;
  isCheckingAvailability = false;

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faCheck = faCheck;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private faIconLibrary: FaIconLibrary
  ) {
    this.faIconLibrary.addIcons(faSearch, faArrowLeft, faArrowRight, faCheck);
    this.dateForm = this.fb.group({
      startDate: ['', [Validators.required, this.futureDateValidator]],
      endDate: ['', Validators.required],
      guestCount: [2, Validators.required]
    }, { validators: this.dateRangeValidator });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, this.cardNumberValidator]],
      touristNote: ['', [Validators.maxLength(500)]]
    });
  }

  cardNumberValidator(control: any): any {
    if (!control.value) {
      return null;
    }
    const value = control.value.toString().replace(/\s/g, '');
    
    if (/^\*{12}\d{4}$/.test(value)) {
      return null;
    }
    
    if (/^\d{13,19}$/.test(value)) {
      return null;
    }
    
    return { invalidCardNumber: true };
  }

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateForm.get('startDate')?.setValue(tomorrow);

    this.loadLastUsedCard();

    this.route.queryParams.subscribe(params => {
      const cabinId = params['cabinId'];
      if (cabinId) {
        this.directBookingCabinId = +cabinId;
      }
    });
  }

  loadLastUsedCard(): void {
    this.reservationService.getLastUsedCard().subscribe({
      next: (cardInfo) => {
        const maskedCard = `**** **** **** ${cardInfo.cardLast4}`;
        this.paymentForm.patchValue({
          cardNumber: maskedCard
        });
      },
      error: (error) => {
      }
    });
  }

  dateRangeValidator(group: FormGroup): any {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) {
      return null;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return startDate >= endDate ? { dateRange: true } : null;
  }

  futureDateValidator(control: any): any {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }

  onDateChange(): void {
    if (this.dateForm.valid) {
      this.availableCabins = [];
      this.selectedCabin = null;
    }
  }

  searchCabins(): void {
    if (this.dateForm.valid) {
      if (this.directBookingCabinId) {
        this.checkCabinAvailability(this.directBookingCabinId);
      } else {
        const { startDate, endDate, guestCount } = this.dateForm.value;
        this.publicService.searchCabins(startDate, endDate, guestCount).subscribe({
          next: (cabins) => {
            this.availableCabins = cabins;
            this.selectedCabin = null;
          },
          error: (error) => {
            console.error('Greška pri pretrazi vikendica:', error);
            this.snackBar.open('Greška pri pretrazi vikendica', 'Zatvori', { duration: 3000 });
          }
        });
      }
    }
  }

  checkCabinAvailability(cabinId: number): void {
    if (!this.dateForm.valid) return;

    this.isCheckingAvailability = true;
    const { startDate, endDate, guestCount } = this.dateForm.value;
    
    this.publicService.getCabin(cabinId).subscribe({
      next: (cabinData) => {
        this.publicService.searchCabins(startDate, endDate, guestCount).subscribe({
          next: (availableCabins) => {
            const isAvailable = availableCabins.some(c => c.cabin.id === cabinId);
            
            if (isAvailable) {
              const targetCabin = availableCabins.find(c => c.cabin.id === cabinId);
              if (targetCabin) {
                this.selectedCabin = targetCabin;
                this.availableCabins = [targetCabin];
                this.snackBar.open(
                  `Vikendica "${cabinData.cabin.name}" je dostupna!`, 
                  'Zatvori', 
                  { duration: 3000 }
                );
                
                setTimeout(() => {
                  if (this.stepper) {
                    this.stepper.next();
                  }
                }, 500);
              }
            } else {
              this.selectedCabin = null;
              this.availableCabins = [];
              this.snackBar.open(
                `Vikendica "${cabinData.cabin.name}" nije dostupna za izabrani period ili broj gostiju. Molimo izaberite drugi period.`, 
                'Zatvori', 
                { duration: 5000 }
              );
            }
            this.isCheckingAvailability = false;
          },
          error: (error) => {
            console.error('Greška pri proveri dostupnosti:', error);
            this.snackBar.open('Greška pri proveri dostupnosti', 'Zatvori', { duration: 3000 });
            this.isCheckingAvailability = false;
          }
        });
      },
      error: (error) => {
        console.error('Greška pri učitavanju vikendice:', error);
        this.snackBar.open('Greška pri učitavanju vikendice', 'Zatvori', { duration: 3000 });
        this.isCheckingAvailability = false;
      }
    });
  }

  selectCabin(cabin: {cabin: Cabin, averageRating: number, thumbnail: number | null}): void {
    this.selectedCabin = cabin;
  }

  isLastStep(): boolean {
    if (!this.stepper) return false;
    const lastStepIndex = this.directBookingCabinId ? 2 : 3;
    return this.stepper.selectedIndex === lastStepIndex;
  }

  canProceed(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: 
        if (this.directBookingCabinId) {
          return this.dateForm.valid && this.selectedCabin !== null;
        }
        return this.dateForm.valid && this.availableCabins.length >= 0;
      case 1: 
        return this.selectedCabin !== null;
      case 2: 
        return this.paymentForm.valid;
      default: 
        return true;
    }
  }

  getNightsCount(): number {
    if (this.dateForm.value.startDate && this.dateForm.value.endDate) {
      const start = new Date(this.dateForm.value.startDate);
      const end = new Date(this.dateForm.value.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  getTotalPrice(): number {
    if (this.selectedCabin) {
      const startDate = new Date(this.dateForm.value.startDate);
      const month = startDate.getMonth() + 1;
      const isSummer = month >= 5 && month <= 8;
      const pricePerNight = isSummer ? this.selectedCabin.cabin.priceSummerRsd : this.selectedCabin.cabin.priceWinterRsd;
      return (pricePerNight ?? 0) * this.getNightsCount();
    }
    return 0;
  }

  createReservation(): void {
    if (this.selectedCabin && this.dateForm.valid && this.paymentForm.valid) {
      const startDate = new Date(this.dateForm.value.startDate);
      const endDate = new Date(this.dateForm.value.endDate);
      
      if (startDate >= endDate) {
        this.snackBar.open('Datum odlaska mora biti posle datuma dolaska!', 'Zatvori', { duration: 5000 });
        return;
      }

      const reservationData = {
        cabinId: this.selectedCabin.cabin.id,
        startDate: this.dateForm.value.startDate.toISOString().split('T')[0],
        endDate: this.dateForm.value.endDate.toISOString().split('T')[0],
        adults: this.dateForm.value.guestCount,
        children: 0,
        cardNumber: this.paymentForm.value.cardNumber.replace(/\s/g, ''),
        touristNote: this.paymentForm.value.touristNote || ''
      };

      this.reservationService.createReservation(reservationData).subscribe({
        next: (reservation) => {
          this.snackBar.open('Rezervacija je uspešno kreirana!', 'Zatvori', { duration: 3000 });
          this.router.navigate(['/tourist/reservations']);
        },
        error: (error) => {
          console.error('Greška pri kreiranju rezervacije:', error);
          let errorMessage = 'Greška pri kreiranju rezervacije';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              if (error.error.includes('Invalid dates')) {
                errorMessage = 'Nevalidni datumi. Datum dolaska mora biti pre datuma odlaska.';
              } else if (error.error.includes('blocked')) {
                errorMessage = 'Vikendica je privremeno blokirana i nije dostupna za rezervacije. Molimo pokušajte kasnije.';
              } else if (error.error.includes('not available')) {
                errorMessage = 'Vikendica nije dostupna za izabrane datume. Postoje druge rezervacije u tom periodu.';
              } else if (error.error.includes('Invalid card')) {
                errorMessage = 'Nevažeći broj kartice. Molimo proverite unete podatke.';
              } else if (error.error.includes('not found')) {
                errorMessage = 'Vikendica nije pronađena.';
              } else {
                errorMessage = error.error;
              }
            }
          }
          
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      if (!this.dateForm.valid) {
        this.snackBar.open('Molimo proverite datume rezervacije', 'Zatvori', { duration: 3000 });
      } else if (!this.selectedCabin) {
        this.snackBar.open('Molimo izaberite vikendicu', 'Zatvori', { duration: 3000 });
      } else if (!this.paymentForm.valid) {
        this.snackBar.open('Molimo proverite podatke za plaćanje', 'Zatvori', { duration: 3000 });
      }
    }
  }
}