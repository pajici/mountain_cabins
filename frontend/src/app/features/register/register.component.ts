import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z]{3})(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/)]],
    gender: ['M', Validators.required],
    address: [''],
    phone: [''],
    cardNumber: ['', [Validators.required, this.cardValidator]],
    role: ['TOURIST', Validators.required]
  });

  selectedFile: File | null = null;
  cardType = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  cardValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const cardNumber = value.replace(/\s/g, '');
    let isValid = false;

    if (/^3[01]/.test(cardNumber) || /^3[68]/.test(cardNumber)) {
      isValid = cardNumber.length === 15;
    } else if (/^5[1-5]/.test(cardNumber)) {
      isValid = cardNumber.length === 16;
    } else if (/^4539|^4556|^4916|^4532|^4929|^4485|^4716/.test(cardNumber)) {
      isValid = cardNumber.length === 16;
    }

    return isValid ? null : { invalidCard: true };
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = new FormData();
      Object.keys(this.registerForm.value).forEach(key => {
        const value = (this.registerForm.value as any)[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }
      this.authService.register(formData).subscribe({
        next: () => {
          this.successMessage = 'Registration request submitted! Please wait for admin approval.';
          this.errorMessage = '';
          this.registerForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Registration failed. Please try again.';
          this.successMessage = '';
        }
      });
    }
  }

  ngOnInit() {
    this.registerForm.get('cardNumber')?.valueChanges.subscribe(value => {
      this.cardType = this.detectCardType(value || '');
    });
  }

  detectCardType(cardNumber: string): string {
    cardNumber = cardNumber.replace(/\s/g, '');
    if (/^3[01]/.test(cardNumber) || /^3[68]/.test(cardNumber)) {
      return cardNumber.length === 15 ? 'DINERS' : '';
    } else if (/^5[1-5]/.test(cardNumber)) {
      return cardNumber.length === 16 ? 'MASTERCARD' : '';
    } else if (/^4539|^4556|^4916|^4532|^4929|^4485|^4716/.test(cardNumber)) {
      return cardNumber.length === 16 ? 'VISA' : '';
    }
    return '';
  }
}