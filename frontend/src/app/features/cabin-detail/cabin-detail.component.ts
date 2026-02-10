import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PublicService } from '../../services/public.service';
import { AuthService } from '../../services/auth.service';
import { Cabin } from '../../models/cabin.model';
import { Review } from '../../models/review.model';
import { User } from '../../models/user.model';
import { MapComponent } from '../../shared/components/map/map.component';
import { CabinGalleryComponent } from '../../shared/components/cabin-gallery/cabin-gallery.component';
import { ImageGalleryModalComponent } from '../../shared/components/image-gallery-modal/image-gallery-modal.component';

@Component({
  selector: 'app-cabin-detail',
  standalone: true,
  imports: [CommonModule, MapComponent, CabinGalleryComponent, MatButtonModule],
  templateUrl: './cabin-detail.component.html',
  styleUrls: ['./cabin-detail.component.scss']
})
export class CabinDetailComponent implements OnInit {
  cabinData: {cabin: Cabin, averageRating: number, reviews: Review[], images: number[]} | null = null;
  isLoggedIn = false;
  userRole = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicService: PublicService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.publicService.getCabin(+id).subscribe({
      next: (data: {cabin: Cabin, averageRating: number, reviews: Review[], images: number[]}) => this.cabinData = data
    });

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || '';
    });
  }

  openImageGallery(event: {images: (string | number)[], startIndex: number}): void {
    this.dialog.open(ImageGalleryModalComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '1200px',
      data: {
        images: event.images,
        cabinName: this.cabinData?.cabin.name || '',
        startIndex: event.startIndex
      }
    });
  }

  bookCabin(): void {
    if (this.cabinData) {
      this.router.navigate(['/tourist/booking'], {
        queryParams: { cabinId: this.cabinData.cabin.id }
      });
    }
  }
}