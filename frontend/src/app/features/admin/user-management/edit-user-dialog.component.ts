import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent {
  userForm: FormGroup;
  isNewUser: boolean;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isNewUser = !data.user;
    this.userForm = this.fb.group({
      username: [data.user?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      firstName: [data.user?.firstName || '', Validators.required],
      lastName: [data.user?.lastName || '', Validators.required],
      role: [data.user?.role || 'TOURIST', Validators.required],
      password: ['', this.isNewUser ? [Validators.required, Validators.minLength(6)] : []],
      phone: [data.user?.phone || ''],
      address: [data.user?.address || ''],
      gender: [data.user?.gender || ''],
      active: [data.user?.active ?? true]
    });
  }

  save(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      const saveOperation = this.isNewUser
        ? this.adminService.createUser(userData)
        : this.adminService.updateUser(this.data.user!.id, userData);

      saveOperation.subscribe({
        next: (user: User) => {
          this.snackBar.open(
            `Korisnik je ${this.isNewUser ? 'dodan' : 'ažuriran'}`,
            'Zatvori',
            { duration: 3000 }
          );
          this.dialogRef.close(user);
        },
        error: (error: any) => {
          console.error('Greška pri čuvanju korisnika:', error);
          this.snackBar.open('Greška pri čuvanju korisnika', 'Zatvori', { duration: 3000 });
        }
      });
    }
  }
}