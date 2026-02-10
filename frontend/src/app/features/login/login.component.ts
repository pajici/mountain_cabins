import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username || '', password || '').subscribe({
        next: () => {
          this.authService.checkAuthStatus();
          this.authService.currentUser$.pipe(
            filter(user => user !== null),
            take(1)
          ).subscribe({
            next: (user) => {
              if (user.role === 'ADMIN') {
                this.router.navigate(['/admin']);
              } else if (user.role === 'OWNER') {
                this.router.navigate(['/owner/profile']);
              } else if (user.role === 'TOURIST') {
                this.router.navigate(['/tourist/profile']);
              } else {
                this.router.navigate(['/cabins']);
              }
            }
          });
        },
        error: (err) => {
          this.errorMessage = 'Prijava neuspešna. Proverite vaše podatke.';
        }
      });
    }
  }
}