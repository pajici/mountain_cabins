import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OwnerService } from '../../../services/owner.service';
import { Cabin } from '../../../models/cabin.model';
import { CabinDialogComponent } from './cabin-dialog/cabin-dialog.component';
import { ImportResultsDialogComponent, ImportResult } from './import-results-dialog/import-results-dialog.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faHome, faUpload } from '@fortawesome/free-solid-svg-icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cabins-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    FontAwesomeModule
  ],
  templateUrl: './cabins-management.component.html',
  styleUrls: ['./cabins-management.component.scss']
})

export class CabinsManagementComponent implements OnInit {
  cabins: Cabin[] = [];
  filteredCabins: Cabin[] = [];
  paginatedCabins: Cabin[] = [];
  displayedColumns: string[] = ['name', 'location', 'pricePerNight', 'status', 'actions'];

  pageSize = 10;
  currentPage = 0;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;
  faHome = faHome;
  faUpload = faUpload;

  constructor(
    private ownerService: OwnerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private faIconLibrary: FaIconLibrary,
    private router: Router
  ) {
    this.faIconLibrary.addIcons(faPlus, faSearch, faEdit, faTrash, faHome, faUpload);
  }

  ngOnInit(): void {
    this.loadCabins();
  }

  loadCabins(): void {
    this.ownerService.getMyCabins().subscribe({
      next: (cabins: Cabin[]) => {
        this.cabins = cabins;
        this.applyFiltersAndSort();
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju vikendica:', error);
        this.snackBar.open('Greška pri učitavanju vikendica', 'Zatvori', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCabins = this.cabins.filter(cabin =>
      cabin.name.toLowerCase().includes(filterValue) ||
      cabin.place.toLowerCase().includes(filterValue)
    );
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    this.filteredCabins = [...this.cabins].sort((a, b) => {
      const aValue = (a as any)[this.sortField];
      const bValue = (b as any)[this.sortField];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

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

  openCabinDialog(cabin?: Cabin): void {
    const dialogRef = this.dialog.open(CabinDialogComponent, {
      width: '800px',
      data: { cabin }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCabins();
      }
    });
  }

  editCabin(cabin: Cabin): void {
    this.openCabinDialog(cabin);
  }

  deleteCabin(cabin: Cabin): void {
    if (confirm(`Da li ste sigurni da želite da obrišete vikendicu "${cabin.name}"?`)) {
      this.ownerService.deleteCabin(cabin.id).subscribe({
        next: () => {
          this.snackBar.open('Vikendica je uspešno obrisana', 'Zatvori', { duration: 3000 });
          this.loadCabins();
        },
        error: (error: any) => {
          console.error('Greška pri brisanju vikendice:', error);
          const errorMessage = error.error || 'Greška pri brisanju vikendice';
          this.snackBar.open(errorMessage, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  getPricePerNight(cabin: Cabin): number {
    const now = new Date();
    const month = now.getMonth() + 1;
    return (month >= 5 && month <= 8) ? cabin.priceSummerRsd : cabin.priceWinterRsd;
  }

  getStatusText(cabin: Cabin): string {
    if (cabin.blockedUntil) {
      const blockedUntil = new Date(cabin.blockedUntil);
      if (blockedUntil > new Date()) {
        return 'Blokirana';
      }
    }
    return 'Aktivna';
  }

  getStatusClass(cabin: Cabin): string {
    if (cabin.blockedUntil) {
      const blockedUntil = new Date(cabin.blockedUntil);
      if (blockedUntil > new Date()) {
        return 'blocked';
      }
    }
    return 'active';
  }

  onJsonFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.snackBar.open('Molimo izaberite JSON fajl', 'Zatvori', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(data)) {
          this.snackBar.open('JSON fajl mora sadržati niz vikendica', 'Zatvori', { duration: 4000 });
          return;
        }

        if (data.length === 0) {
          this.snackBar.open('JSON fajl ne sadrži nijednu vikendicu', 'Zatvori', { duration: 3000 });
          return;
        }

        const validationErrors: string[] = [];
        const validatedCabins: any[] = [];

        data.forEach((cabin: any, index: number) => {
          const errors: string[] = [];
          
          if (!cabin.name || typeof cabin.name !== 'string' || cabin.name.trim() === '') {
            errors.push(`Vikendica ${index + 1}: Nedostaje naziv`);
          }
          if (!cabin.place || typeof cabin.place !== 'string' || cabin.place.trim() === '') {
            errors.push(`Vikendica ${index + 1}: Nedostaje mesto`);
          }
          if (cabin.capacity === undefined || cabin.capacity === null || typeof cabin.capacity !== 'number' || cabin.capacity < 1) {
            errors.push(`Vikendica ${index + 1}: Kapacitet mora biti broj veći od 0`);
          }
          if (cabin.priceSummerRsd === undefined || cabin.priceSummerRsd === null || typeof cabin.priceSummerRsd !== 'number' || cabin.priceSummerRsd < 0) {
            errors.push(`Vikendica ${index + 1}: Letnja cena mora biti broj veći ili jednak 0`);
          }
          if (cabin.priceWinterRsd === undefined || cabin.priceWinterRsd === null || typeof cabin.priceWinterRsd !== 'number' || cabin.priceWinterRsd < 0) {
            errors.push(`Vikendica ${index + 1}: Zimska cena mora biti broj veći ili jednak 0`);
          }

          if (errors.length > 0) {
            validationErrors.push(...errors);
          } else {
            validatedCabins.push({
              name: cabin.name.trim(),
              place: cabin.place.trim(),
              capacity: Math.floor(cabin.capacity),
              priceSummerRsd: Math.floor(cabin.priceSummerRsd),
              priceWinterRsd: Math.floor(cabin.priceWinterRsd),
              servicesText: cabin.servicesText || cabin.services || '',
              description: cabin.description || '',
              phone: cabin.phone || '',
              lat: cabin.lat || cabin.latitude || 0.0,
              lng: cabin.lng || cabin.longitude || 0.0
            });
          }
        });

        if (validationErrors.length > 0) {
          const errorMessage = validationErrors.slice(0, 5).join('\n') + 
            (validationErrors.length > 5 ? `\n... i još ${validationErrors.length - 5} grešaka` : '');
          this.snackBar.open(`Greške u JSON fajlu:\n${errorMessage}`, 'Zatvori', { duration: 8000 });
          return;
        }

        this.showImportPreview(validatedCabins);
      } catch (error) {
        console.error('Greška pri parsiranju JSON fajla:', error);
        this.snackBar.open('Nevažeći JSON format - fajl mora biti ispravan JSON', 'Zatvori', { duration: 4000 });
      }
    };
    reader.readAsText(file);

    (event.target as HTMLInputElement).value = '';
  }

  showImportPreview(cabinsData: any[]): void {
    const previewText = cabinsData.map((cabin, index) => 
      `${index + 1}. ${cabin.name || 'Nepoznato ime'} - ${cabin.place || 'Nepoznato mesto'}`
    ).join('\n');

    if (confirm(`Pregled uvoza (${cabinsData.length} vikendica):\n\n${previewText}\n\nDa li želite da uvezete ove vikendice?`)) {
      this.importCabins(cabinsData);
    }
  }

  importCabins(cabinsData: any[]): void {
    const importRequests = cabinsData.map(cabinData => 
      this.ownerService.createCabin(cabinData).pipe(
        catchError(error => of({ error: true, errorMessage: error.message || 'Greška pri uvozu', data: cabinData }))
      )
    );

    forkJoin(importRequests).subscribe({
      next: (results: any[]) => {
        const successResults: Array<{name: string, place: string}> = [];
        const failedResults: Array<{name: string, place: string, error: string}> = [];

        results.forEach((result, index) => {
          const cabin = cabinsData[index];
          if (result.error) {
            failedResults.push({
              name: cabin.name || 'Nepoznato',
              place: cabin.place || 'Nepoznato mesto',
              error: result.errorMessage
            });
          } else {
            successResults.push({
              name: result.name || cabin.name,
              place: result.place || cabin.place
            });
          }
        });

        const dialogRef = this.dialog.open(ImportResultsDialogComponent, {
          width: '600px',
          data: {
            success: successResults,
            failed: failedResults
          } as ImportResult
        });

        dialogRef.afterClosed().subscribe(() => {
          this.loadCabins();
        });
      },
      error: (error: any) => {
        console.error('Greška pri uvozu vikendica:', error);
        this.snackBar.open('Greška pri uvozu vikendica', 'Zatvori', { duration: 3000 });
      }
    });
  }
}