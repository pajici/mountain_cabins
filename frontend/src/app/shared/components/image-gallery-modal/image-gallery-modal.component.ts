import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faChevronLeft, faHourglass, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-image-gallery-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, FontAwesomeModule],
  templateUrl: './image-gallery-modal.component.html',
  styleUrls: ['./image-gallery-modal.component.scss']
})
export class ImageGalleryModalComponent implements OnInit {
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faHourglass = faHourglass;
  faChevronRight = faChevronRight;

  images: (string | number)[] = [];
  cabinName: string = '';
  currentIndex: number = 0;
  isLoading: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<ImageGalleryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { images: (string | number)[], cabinName: string, startIndex: number },
    private library: FaIconLibrary
  ) {
    library.addIcons(faTimes, faChevronLeft, faHourglass, faChevronRight);
  }

  ngOnInit(): void {
    this.images = this.data.images;
    this.cabinName = this.data.cabinName;
    this.currentIndex = this.data.startIndex || 0;
  }

  getCurrentImageUrl(): string {
    return this.getImageUrl(this.images[this.currentIndex]);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'number') {
      return `/api/public/images/${image}`;
    }
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `/api/images/${image}`;
    }
    return '/assets/placeholder-cabin.svg';
  }

  setCurrentImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.isLoading = true;
    }
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.setCurrentImage(this.currentIndex - 1);
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.setCurrentImage(this.currentIndex + 1);
    }
  }

  onImageLoad(event: Event): void {
    this.isLoading = false;
  }

  onImageError(event: Event): void {
    this.isLoading = false;
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-cabin.svg';
  }

  onThumbnailError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-cabin.svg';
  }

  close(): void {
    this.dialogRef.close();
  }
}