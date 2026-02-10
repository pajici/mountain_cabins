import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faBan, faStar, faMapMarkerAlt, faPhone, faUser, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Cabin } from '../../../models/cabin.model';

@Component({
  selector: 'app-cabin-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FontAwesomeModule
  ],
  templateUrl: './cabin-details-dialog.component.html',
  styleUrls: ['./cabin-details-dialog.component.scss']
})
export class CabinDetailsDialogComponent {
  faCheckCircle = faCheckCircle;
  faBan = faBan;
  faStar = faStar;
  faMapMarkerAlt = faMapMarkerAlt;
  faPhone = faPhone;
  faUser = faUser;
  faMoneyBillWave = faMoneyBillWave;

  averageRating?: number;

  constructor(
    public dialogRef: MatDialogRef<CabinDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cabin & { averageRating?: number }
  ) {
    this.averageRating = data.averageRating;
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
