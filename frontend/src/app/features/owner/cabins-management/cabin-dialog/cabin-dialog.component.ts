import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Cabin } from '../../../../models/cabin.model';
import { OwnerService } from '../../../../services/owner.service';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faSave, faPlus, faImages } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cabin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    FontAwesomeModule
  ],
  templateUrl: './cabin-dialog.component.html',
  styleUrls: ['./cabin-dialog.component.scss']
})

export class CabinDialogComponent implements OnInit {
  cabinForm: FormGroup;
  isEdit = false;
  selectedImages: File[] = [];

  faTimes = faTimes;
  faSave = faSave;
  faPlus = faPlus;
  faImages = faImages;

  constructor(
    private fb: FormBuilder,
    private ownerService: OwnerService,
    private dialogRef: MatDialogRef<CabinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cabin?: Cabin },
    private snackBar: MatSnackBar,
    private faIconLibrary: FaIconLibrary
  ) {
    this.faIconLibrary.addIcons(faTimes, faSave, faPlus, faImages);
    this.cabinForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      services: [''],
      description: [''],
      summerPrice: [0, [Validators.required, Validators.min(0)]],
      winterPrice: [0, [Validators.required, Validators.min(0)]],
      phone: [''],
      latitude: [0],
      longitude: [0],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data?.cabin) {
      this.isEdit = true;
      this.cabinForm.patchValue({
        name: this.data.cabin.name,
        location: this.data.cabin.place,
        capacity: this.data.cabin.capacity || 1,
        services: this.data.cabin.servicesText || '',
        description: this.data.cabin.description || '',
        summerPrice: this.data.cabin.priceSummerRsd,
        winterPrice: this.data.cabin.priceWinterRsd,
        phone: this.data.cabin.phone || '',
        latitude: this.data.cabin.lat || 0,
        longitude: this.data.cabin.lng || 0,
        active: !this.data.cabin.blockedUntil
      });
    }
  }

  save(): void {
    if (this.cabinForm.valid) {
      const formValue = this.cabinForm.value;
      
      const cabinData: any = {
        name: formValue.name,
        place: formValue.location,
        servicesText: formValue.services,
        description: formValue.description,
        capacity: parseInt(formValue.capacity) || 1,
        phone: formValue.phone || null,
        lat: parseFloat(formValue.latitude) || 0.0,
        lng: parseFloat(formValue.longitude) || 0.0,
        priceSummerRsd: parseInt(formValue.summerPrice) || 0,
        priceWinterRsd: parseInt(formValue.winterPrice) || 0
      };

      if (this.isEdit) {
        cabinData.id = this.data.cabin!.id;
        cabinData.ownerId = this.data.cabin!.ownerId;
      }

      const request = this.isEdit
        ? this.ownerService.updateCabin(this.data.cabin!.id, cabinData)
        : this.ownerService.createCabin(cabinData);

      request.subscribe({
        next: (cabin: Cabin) => {
          if (this.selectedImages.length > 0) {
            if (!cabin.id || cabin.id === 0) {
              console.error('Neispravan cabin ID:', cabin.id);
              this.snackBar.open(
                'Greška: Vikendica je kreirana, ali nema ispravan ID',
                'Zatvori',
                { duration: 5000 }
              );
              this.dialogRef.close(cabin);
              return;
            }
            
            this.uploadImages(cabin.id).subscribe({
              next: () => {
                this.snackBar.open(
                  `Vikendica i slike su ${this.isEdit ? 'ažurirane' : 'kreirane'} uspešno`,
                  'Zatvori',
                  { duration: 3000 }
                );
                this.dialogRef.close(cabin);
              },
              error: (imgError: any) => {
                console.error('Greška pri otpremanju slika:', imgError);
                this.snackBar.open(
                  `Vikendica je ${this.isEdit ? 'ažurirana' : 'kreirana'}, ali greška pri otpremanju slika`,
                  'Zatvori',
                  { duration: 5000 }
                );
                this.dialogRef.close(cabin);
              }
            });
          } else {
            this.snackBar.open(
              `Vikendica je ${this.isEdit ? 'ažurirana' : 'kreirana'} uspešno`,
              'Zatvori',
              { duration: 3000 }
            );
            this.dialogRef.close(cabin);
          }
        },
        error: (error: any) => {
          console.error('Greška pri čuvanju vikendice:', error);
          const errorMessage = error.error?.message || error.message || 'Greška pri čuvanju vikendice';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      Object.keys(this.cabinForm.controls).forEach(key => {
        this.cabinForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Molimo popunite sva obavezna polja', 'Zatvori', { duration: 3000 });
    }
  }

  onImagesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = Array.from(files);
    }
  }

  uploadImages(cabinId: number): Observable<any> {
    const formData = new FormData();
    this.selectedImages.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.ownerService.uploadCabinImages(cabinId, formData);
  }
}
