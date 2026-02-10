import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  get isCabinDetail(): boolean {
    return this.router.url.includes('/cabins/') && !this.router.url.endsWith('/cabins');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  goBack() {
    this.router.navigate(['/cabins']);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/cabins';
    }, (error) => {
      console.error('Logout failed', error);
      window.location.href = '/cabins';
    });
  }
}