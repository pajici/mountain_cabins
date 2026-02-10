import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearchPlus, faImages, faImage } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cabin-gallery',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, FontAwesomeModule],
  templateUrl: './cabin-gallery.component.html',
  styleUrls: ['./cabin-gallery.component.scss']
})
export class CabinGalleryComponent {
  @Input() images: (string | number)[] = [];
  @Input() cabinName: string = '';

  @Output() imageClick = new EventEmitter<{images: (string | number)[], startIndex: number}>();

  faSearchPlus = faSearchPlus;
  faImages = faImages;
  faImage = faImage;

  constructor(private dialog: MatDialog, private library: FaIconLibrary) {
    library.addIcons(faSearchPlus, faImages, faImage);
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

  openGallery(startIndex: number): void {
    this.imageClick.emit({
      images: this.images,
      startIndex: startIndex
    });
  }
}