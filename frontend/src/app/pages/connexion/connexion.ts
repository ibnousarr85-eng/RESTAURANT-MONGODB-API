import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css'
})
export class Connexion {

  private authService = inject(AuthService);
  private router = inject(Router);

  nomUtilisateur = '';
  motDePasse = '';

  messageErreur = '';
  chargement = false;

  seConnecter(): void {
    this.messageErreur = '';

    if (!this.nomUtilisateur.trim() || !this.motDePasse) {
      this.messageErreur = 'Veuillez remplir tous les champs.';
      return;
    }

    this.chargement = true;

    this.authService.connecter(
      this.nomUtilisateur.trim(),
      this.motDePasse
    ).subscribe({

      next: () => {
        this.chargement = false;
        this.motDePasse = '';
        this.router.navigate(['/dashboard']);
      },

      error: (erreur) => {
        this.chargement = false;
        this.messageErreur =
          erreur.error?.message || 'Impossible de se connecter au serveur.';
      }

    });
  }
}
