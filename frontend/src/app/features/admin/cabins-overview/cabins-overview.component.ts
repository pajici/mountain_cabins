import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch, faStar, faEye, faBan, faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from 'services/admin.service';
import { PublicService } from 'services/public.service';
import { Cabin } from 'models/cabin.model';
import { CabinDetailsDialogComponent } from './cabin-details-dialog.component';

@Component({
  selector: 'app-cabins-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './cabins-overview.component.html',
  styleUrls: ['./cabins-overview.component.scss']
})

export class CabinsOverviewComponent implements OnInit {
  faSearch = faSearch;
  faStar = faStar;
  faEye = faEye;
  faBan = faBan;
  faCheckCircle = faCheckCircle;
  faHome = faHome;

  cabins: {cabin: Cabin, averageRating: number}[] = [];
  filteredCabins: {cabin: Cabin, averageRating: number}[] = [];
  paginatedCabins: {cabin: Cabin, averageRating: number}[] = [];
  displayedColumns: string[] = ['name', 'owner', 'location', 'rating', 'status', 'actions'];

  pageSize = 10;
  currentPage = 0;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  ratingControl = new FormControl('');

  constructor(
    private adminService: AdminService,
    private publicService: PublicService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private library: FaIconLibrary
  ) {
    library.addIcons(faSearch, faStar, faEye, faBan, faCheckCircle, faHome);
  }

  ngOnInit(): void {
    this.loadCabins();

    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
    this.ratingControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadCabins(): void {
    this.adminService.getAllCabins().subscribe({
      next: (cabins) => {
        this.cabins = cabins.map(c => ({
          cabin: {
            id: c.id,
            name: c.name,
            place: c.place,
            ownerName: c.ownerName,
            ownerId: c.ownerId,
            status: c.status,
            priceSummerRsd: c.priceSummerRsd,
            priceWinterRsd: c.priceWinterRsd,
            phone: c.phone,
            blockedUntil: c.blockedUntil,
            hasLowRatings: c.hasLowRatings,
            lastThreeRatings: c.lastThreeRatings
          } as any,
          averageRating: c.averageRating || 0
        }));
        this.applyFilters();
      },
      error: (error) => {
        console.error('Greška pri učitavanju vikendica:', error);
        this.snackBar.open('Greška pri učitavanju vikendica', 'Zatvori', { duration: 3000 });
      }
    });
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.cabins];

    const searchValue = this.searchControl.value?.toLowerCase();
    if (searchValue) {
      filtered = filtered.filter(item =>
        item.cabin.name.toLowerCase().includes(searchValue) ||
        item.cabin.ownerName?.toLowerCase().includes(searchValue) ||
        item.cabin.place.toLowerCase().includes(searchValue)
      );
    }

    const statusValue = this.statusControl.value;
    if (statusValue) {
      filtered = filtered.filter(item => item.cabin.status === statusValue);
    }

    const ratingValue = this.ratingControl.value;
    if (ratingValue) {
      filtered = filtered.filter(item => {
        switch (ratingValue) {
          case 'low': return item.averageRating < 3.0;
          case 'medium': return item.averageRating >= 3.0 && item.averageRating <= 4.0;
          case 'high': return item.averageRating > 4.0;
          default: return true;
        }
      });
    }

    filtered.sort((a, b) => {
      const aValue = (a.cabin as any)[this.sortField];
      const bValue = (b.cabin as any)[this.sortField];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredCabins = filtered;
    this.updatePaginatedData();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCabins = this.filteredCabins.slice(startIndex, endIndex);
  }

  viewDetails(cabinData: {cabin: Cabin, averageRating: number}): void {
    this.dialog.open(CabinDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { ...cabinData.cabin, averageRating: cabinData.averageRating },
      panelClass: 'cabin-details-dialog-container'
    });
  }

  blockCabin(cabin: Cabin): void {
    if (!cabin.hasLowRatings) {
      this.snackBar.open('⚠️ Samo vikendice sa poslednje 3 ocene manje od 2.0 mogu biti blokirane', 'Zatvori', { duration: 5000 });
      return;
    }

    const ratingsText = cabin.lastThreeRatings?.map(r => r.toFixed(1)).join(', ') || 'N/A';
    const message = `
═══════════════════════════════════════
⚠️  BLOKIRANJE VIKENDICE
═══════════════════════════════════════

Vikendica: ${cabin.name}
Vlasnik: ${cabin.ownerName}
Lokacija: ${cabin.place}

⭐ Poslednje 3 ocene: ${ratingsText}
(sve su < 2.0)

Vikendica će biti blokirana na 48 sati i 
neće biti dostupna za rezervacije.

Da li ste sigurni?
═══════════════════════════════════════
    `.trim();
    
    if (confirm(message)) {
      this.adminService.blockCabin(cabin.id).subscribe({
        next: () => {
          this.snackBar.open('✅ Vikendica je blokirana na 48 sati', 'Zatvori', { duration: 3000 });
          this.loadCabins();
        },
        error: (error) => {
          console.error('Greška pri blokiranju vikendice:', error);
          const errorMsg = error.error?.error || 'Greška pri blokiranju vikendice';
          this.snackBar.open(`❌ ${errorMsg}`, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  unblockCabin(cabin: Cabin): void {
    const message = `
═══════════════════════════════════════
🔓 ODBLOKIRANJE VIKENDICE
═══════════════════════════════════════

Vikendica: ${cabin.name}
Vlasnik: ${cabin.ownerName}

Vikendica će ponovo biti dostupna za 
rezervacije.

Da li ste sigurni?
═══════════════════════════════════════
    `.trim();
    
    if (confirm(message)) {
      this.adminService.unblockCabin(cabin.id).subscribe({
        next: () => {
          this.snackBar.open('✅ Vikendica je odblokirana', 'Zatvori', { duration: 3000 });
          this.loadCabins();
        },
        error: (error) => {
          console.error('Greška pri odblokiranju vikendice:', error);
          this.snackBar.open('❌ Greška pri odblokiranju vikendice', 'Zatvori', { duration: 3000 });
        }
      });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Aktivna';
      case 'BLOCKED': return 'Blokirana';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'BLOCKED': return 'warn';
      default: return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'check_circle';
      case 'BLOCKED': return 'block';
      default: return 'help';
    }
  }
}