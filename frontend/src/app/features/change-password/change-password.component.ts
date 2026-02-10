import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FontAwesomeModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  faSave = faSave;
  faTimes = faTimes;

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private library: FaIconLibrary
  ) {
    library.addIcons(faSave, faTimes);
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const passwordRegex = /^(?=.*[a-z]{3})(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/;
    return passwordRegex.test(value) ? null : { invalidPassword: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const oldPassword = this.passwordForm.value.oldPassword || '';
      const newPassword = this.passwordForm.value.newPassword || '';
      const confirmPassword = this.passwordForm.value.confirmPassword || '';
      this.authService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
        next: () => {
          this.snackBar.open('Lozinka je uspešno promenjena', 'Zatvori', { duration: 3000 });
          const loginPath = this.authService.hasRole('ADMIN') ? '/admin/login' : '/login';
          this.router.navigate([loginPath]);
        },
        error: (error: any) => {
          console.error('ChangePasswordComponent: Error in password change:', error);
          this.snackBar.open('Greška pri promeni lozinke. Proverite trenutnu lozinku.', 'Zatvori', { duration: 3000 });
        }
      });
    }
  }

  cancel(): void {
    if (this.authService.hasRole('ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (this.authService.hasRole('OWNER')) {
      this.router.navigate(['/owner']);
    } else if (this.authService.hasRole('TOURIST')) {
      this.router.navigate(['/tourist']);
    } else {
      this.router.navigate(['/cabins']);
    }
  }
}
