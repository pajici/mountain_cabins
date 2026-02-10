import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export interface ImportResult {
  success: Array<{name: string, place: string}>;
  failed: Array<{name: string, place: string, error: string}>;
}

@Component({
  selector: 'app-import-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './import-results-dialog.component.html',
  styleUrls: ['./import-results-dialog.component.scss']
})
export class ImportResultsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImportResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportResult
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
