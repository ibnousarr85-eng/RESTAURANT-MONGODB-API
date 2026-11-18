import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Commande } from '../../models/commande';
import { CommandeApi } from '../../services/commande-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private commandeApi = inject(CommandeApi);
  private cdr = inject(ChangeDetectorRef);

  commandes: Commande[] = [];

  chargement = true;
  erreur = '';

  ngOnInit(): void {
    this.chargerDashboard();
  }

  chargerDashboard(): void {

    this.chargement = true;
    this.erreur = '';

    this.commandeApi.getCommandes(1).subscribe({

      next: (premierePage) => {

        const nombrePages = premierePage.pages;

        const autresRequetes = Array.from(
          { length: nombrePages - 1 },
          (_, index) => this.commandeApi.getCommandes(index + 2)
        );

        if (autresRequetes.length === 0) {

          this.commandes = premierePage.resultats;
          this.chargement = false;

          this.cdr.detectChanges();

          return;
        }

        forkJoin(autresRequetes).subscribe({

          next: (autresPages) => {

            this.commandes = [
              ...premierePage.resultats,
              ...autresPages.flatMap(page => page.resultats)
            ];

            this.chargement = false;

            this.cdr.detectChanges();
          },

          error: (err) => {

            console.error('Erreur chargement des pages :', err);

            this.erreur = 'Impossible de charger toutes les commandes.';
            this.chargement = false;

            this.cdr.detectChanges();
          }

        });
      },

      error: (err) => {

        console.error('Erreur API Dashboard :', err);

        this.erreur = 'Impossible de contacter le serveur.';
        this.chargement = false;

        this.cdr.detectChanges();
      }

    });
  }

  // Nombre total de commandes
  get nombreCommandes(): number {
    return this.commandes.length;
  }

  // Chiffre d'affaires
  get chiffreAffaires(): number {
    return this.commandes
      .filter(c => c.statut === 'Payée')
      .reduce((total, c) => total + c.total, 0);
  }

  // Nombre de commandes payÃ©es
  get nombreCommandesPayees(): number {
    return this.commandes.filter(
      c => c.statut === 'Payée'
    ).length;
  }

  // Nombre de commandes en cours
  get commandesEnCours(): number {
    return this.commandes.filter(
      c => c.statut === 'En cours'
    ).length;
  }

  // Nombre de commandes annulÃ©es
  get commandesAnnulees(): number {
    return this.commandes.filter(
      c => c.statut === 'Annulée'
    ).length;
  }

  // DonnÃ©es pour le graphique du chiffre d'affaires

// Répartition illustrative du chiffre d'affaires sur six mois
get evolutionCA(): {
  label: string;
  montant: number;
  hauteur: number;
}[] {

  const totalCA = this.chiffreAffaires;

  const repartition = [
    { label: 'Avr', pourcentage: 12 },
    { label: 'Mai', pourcentage: 14 },
    { label: 'Juin', pourcentage: 16 },
    { label: 'Juil', pourcentage: 18 },
    { label: 'Août', pourcentage: 19 },
    { label: 'Sept', pourcentage: 21 }
  ];

  let montantDejaReparti = 0;

  const mois = repartition.map((element, index) => {

    let montant: number;

    if (index === repartition.length - 1) {
      // Le dernier mois récupère le reste pour garantir le total exact.
      montant = totalCA - montantDejaReparti;
    } else {
      montant = Math.round(
        totalCA * element.pourcentage / 100
      );

      montantDejaReparti += montant;
    }

    return {
      label: element.label,
      montant,
      hauteur: 0
    };
  });

  const maximum = Math.max(
    ...mois.map(m => m.montant),
    0
  );

  return mois.map(m => ({
    label: m.label,
    montant: m.montant,
    hauteur: maximum > 0
      ? Math.max(5, (m.montant / maximum) * 100)
      : 0
  }));
}
  // RÃ©partition des commandes par statut
  get repartitionStatuts() {

    const total = this.nombreCommandes;

    return [
      {
        label: 'Payées',
        nombre: this.nombreCommandesPayees,
        pourcentage: total > 0
          ? (this.nombreCommandesPayees / total) * 100
          : 0,
        classe: 'barre-payee'
      },
      {
        label: 'En cours',
        nombre: this.commandesEnCours,
        pourcentage: total > 0
          ? (this.commandesEnCours / total) * 100
          : 0,
        classe: 'barre-attente'
      },
      {
        label: 'Annulées',
        nombre: this.commandesAnnulees,
        pourcentage: total > 0
          ? (this.commandesAnnulees / total) * 100
          : 0,
        classe: 'barre-annulee'
      }
    ];
  }

  // Les cinq derniÃ¨res commandes
  get dernieresCommandes(): Commande[] {
    return [...this.commandes]
      .sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }

}
