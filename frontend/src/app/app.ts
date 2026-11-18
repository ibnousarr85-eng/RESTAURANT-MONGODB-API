import { Component, signal, inject } from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private router = inject(Router);
  private authService = inject(AuthService);

  protected readonly title = signal('Baobab Gourmand');

  protected estAdministration = signal(false);

  constructor() {

    this.mettreAJourLayout();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.mettreAJourLayout();
      });

  }

  private mettreAJourLayout(): void {

    const url = this.router.url.split('?')[0];

    this.estAdministration.set(
      ['/dashboard', '/plats', '/commandes'].some(
        route => url === route || url.startsWith(route + '/')
      )
    );

  }

  deconnecter(): void {

    this.authService.deconnecter().subscribe({
      next: () => {
        this.router.navigate(['/connexion']);
      },
      error: () => {
        this.router.navigate(['/connexion']);
      }
    });

  }

}
