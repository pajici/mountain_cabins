import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUserCircle, faCamera, faLock, faSave, faSync } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    FontAwesomeModule
  ],
  templateUrl: './owner-profile.component.html',
  styleUrls: ['./owner-profile.component.scss']
})
export class OwnerProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  selectedFile: File | null = null;

  faUserCircle = faUserCircle;
  faCamera = faCamera;
  faLock = faLock;
  faSave = faSave;
  faSync = faSync;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private faIconLibrary: FaIconLibrary
  ) {
    this.faIconLibrary.addIcons(faUserCircle, faCamera, faLock, faSave, faSync);
    this.profileForm = this.fb.group({
      username: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^(\+381|0)\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{3,4}$/)]],
      email: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          address: user.address,
          phone: user.phone,
          email: user.email
        });
      },
      error: (error) => {
        console.error('Greška pri učitavanju profila:', error);
        this.snackBar.open('Greška pri učitavanju profila', 'Zatvori', { duration: 3000 });
        this.user = this.authService.getCurrentUser();
        if (this.user) {
          this.profileForm.patchValue({
            username: this.user.username,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            gender: this.user.gender,
            address: this.user.address,
            phone: this.user.phone,
            email: this.user.email
          });
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
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
            this.loadUserProfile();
          },
          error: (error) => {
            console.error('Greška pri ažuriranju profila:', error);
            this.snackBar.open('Greška pri ažuriranju profila', 'Zatvori', { duration: 3000 });
          }
        });
      } else {
        this.authService.updateProfile(this.profileForm.value).subscribe({
          next: () => {
            this.snackBar.open('Profil je uspešno ažuriran', 'Zatvori', { duration: 3000 });
            this.profileForm.markAsPristine();
            this.loadUserProfile();
          },
          error: (error) => {
            console.error('Greška pri ažuriranju profila:', error);
            this.snackBar.open('Greška pri ažuriranju profila', 'Zatvori', { duration: 3000 });
          }
        });
      }
    }
  }

  resetForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        gender: this.user.gender,
        address: this.user.address,
        phone: this.user.phone,
        email: this.user.email
      });
      this.profileForm.markAsPristine();
    }
    this.selectedFile = null;
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  getProfileImage(): string {
    if (this.user && this.user.profileImageId) {
      return `/api/public/images/${this.user.profileImageId}`;
    }
    return '/assets/images/planinska_vikendica_logo.png';
  }
}
