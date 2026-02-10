import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { OwnerService } from '../../../services/owner.service';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FontAwesomeModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef;
  @ViewChild('performanceChart') performanceChartCanvas!: ElementRef;

  faSync = faSync;

  private revenueChart?: Chart;
  private performanceChart?: Chart;

  constructor(
    private ownerService: OwnerService,
    private library: FaIconLibrary
  ) {
    library.addIcons(faSync);
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.ownerService.getMonthlyReservations().subscribe({
      next: (monthlyData: any[]) => {
        this.createMonthlyReservationsChart(monthlyData);
      },
      error: (err: any) => console.error('Error loading monthly reservations:', err)
    });

    this.ownerService.getWeekendVsWeekday().subscribe({
      next: (weekendData: any[]) => {
        this.createWeekendVsWeekdayChart(weekendData);
      },
      error: (err: any) => console.error('Error loading weekend stats:', err)
    });
  }

  createCharts(): void {
  }

  createMonthlyReservationsChart(data: any[]): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC'];
    
    const datasets = data.map((cabin: any, index: number) => {
      const colors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ];
      
      const monthlyCounts = new Array(12).fill(0);
      cabin.monthlyData.forEach((month: any) => {
        const monthIndex = monthLabels.indexOf(month.month.substring(0, 3).toUpperCase());
        if (monthIndex >= 0) {
          monthlyCounts[monthIndex] = month.count;
        }
      });
      
      return {
        label: cabin.cabinName,
        data: monthlyCounts,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1
      };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            display: true
          },
          title: {
            display: true,
            text: 'Broj rezervacija po mesecima za svaku vikendicu'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.revenueChart = new Chart(this.revenueChartCanvas.nativeElement, config);
  }

  createWeekendVsWeekdayChart(data: any[]): void {
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    const totalWeekend = data.reduce((sum, cabin) => sum + cabin.weekendCount, 0);
    const totalWeekday = data.reduce((sum, cabin) => sum + cabin.weekdayCount, 0);

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Vikend rezervacije', 'Radni dan rezervacije'],
        datasets: [{
          label: 'Broj rezervacija',
          data: [totalWeekend, totalWeekday],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Odnos rezervacija: Vikend vs. Radni dan'
          }
        }
      }
    };

    this.performanceChart = new Chart(this.performanceChartCanvas.nativeElement, config);
  }

  ngOnDestroy(): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
  }
}