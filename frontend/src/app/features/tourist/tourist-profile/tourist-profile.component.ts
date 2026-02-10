import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faPhone, faHome, faSync, faLock, faSave, faUserCheck } from '@fortawesome/free-solid-svg-icons';

interface TouristProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-tourist-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './tourist-profile.component.html',
  styleUrls: ['./tourist-profile.component.scss']
})
export class TouristProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: User | null = null;
  selectedFile: File | null = null;

  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faHome = faHome;
  faSync = faSync;
  faLock = faLock;
  faSave = faSave;
  faUserCheck = faUserCheck;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private library: FaIconLibrary
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+381|0)\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3,4}$/)]],
      address: ['', Validators.required]
    });

    library.addIcons(faUser, faEnvelope, faPhone, faHome, faSync, faLock, faSave, faUserCheck);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile: User) => {
        this.profile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address
        });
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju profila:', error);
        this.snackBar.open('Greška pri učitavanju profila', 'Zatvori', { duration: 3000 });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      if (this.selectedFile) {
        const formData = new FormData();
        Object.keys(this.profileForm.value).forEach(key => {
          const value = (this.profileForm.value as any)[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append('profileImage', this.selectedFile);

        this.authService.updateProfileWithImage(formData).subscribe({
          next: () => {
            this.snackBar.open('Profil je uspešno ažuriran (sa slikom)', 'Zatvori', { duration: 3000 });
            this.selectedFile = null;
            this.profileForm.markAsPristine();
            this.loadProfile();
          },
          error: (error: any) => {
            console.error('Greška pri ažuriranju profila:', error);
            this.snackBar.open('Greška pri ažuriranju profila', 'Zatvori', { duration: 3000 });
          }
        });
      } else {
        this.authService.updateProfile(this.profileForm.value).subscribe({
          next: () => {
            this.snackBar.open('Profil je uspešno ažuriran', 'Zatvori', { duration: 3000 });
            this.profileForm.markAsPristine();
            this.loadProfile();
          },
          error: (error: any) => {
            console.error('Greška pri ažuriranju profila:', error);
            this.snackBar.open('Greška pri ažuriranju profila', 'Zatvori', { duration: 3000 });
          }
        });
      }
    }
  }

  resetForm(): void {
    if (this.profile) {
      this.profileForm.patchValue(this.profile);
      this.profileForm.markAsPristine();
    }
    this.selectedFile = null;
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  getProfileImage(): string {
    const user = this.authService.getCurrentUser();
    if (user && user.profileImageId) {
      return `/api/public/images/${user.profileImageId}`;
    }
    return '/assets/images/planinska_vikendica_logo.png';
  }
}