import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Commande } from '../../models/commande';
import { Page } from '../../models/page';
import { CommandeApi } from '../../services/commande-api';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commandes.html',
  styleUrl: './commandes.css'
})
export class Commandes implements OnInit {

  private commandeApi = inject(CommandeApi);
  private cdr = inject(ChangeDetectorRef);

  donnees!: Page<Commande>;

  statutSelectionne = '';

  chargement = false;
  erreur = '';

  // Gestion de la fenêtre des détails
  commandeSelectionnee: Commande | null = null;
  chargementDetails = false;
  erreurDetails = '';

  ngOnInit(): void {
    this.chargerCommandes(1);
  }

  chargerCommandes(page: number): void {

    this.chargement = true;
    this.erreur = '';

    this.commandeApi.getCommandes(
      page,
      this.statutSelectionne
    ).subscribe({

      next: (reponse) => {

        console.log('COMMANDES REÇUES PAR ANGULAR :', reponse);

        this.donnees = reponse;
        this.chargement = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('Erreur API :', err);

        this.erreur = 'Impossible de récupérer les commandes.';
        this.chargement = false;

        this.cdr.detectChanges();

      }

    });

  }

  changerStatut(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.statutSelectionne = select.value;

    this.chargerCommandes(1);

  }

  changerPage(page: number): void {

    if (!this.donnees) return;

    if (page < 1 || page > this.donnees.pages) return;

    this.chargerCommandes(page);

  }

  // Récupérer les détails d'une commande
  voirDetails(commande: Commande): void {

    this.chargementDetails = true;
    this.erreurDetails = '';
    this.commandeSelectionnee = commande;

    this.commandeApi.getCommande(commande.numero).subscribe({

      next: (reponse) => {

        this.commandeSelectionnee = reponse;
        this.chargementDetails = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('Erreur détails commande :', err);

        this.erreurDetails = 'Impossible de récupérer les détails.';
        this.chargementDetails = false;

        this.cdr.detectChanges();

      }

    });

  }

  // Fermer la fenêtre des détails
  fermerDetails(): void {

    this.commandeSelectionnee = null;
    this.erreurDetails = '';

  }

  encaisserCommande(commande: Commande): void {

    const modePaiement = window.prompt(
      'Choisissez le mode de paiement :\n\n1 - Espèces\n2 - Wave\n3 - Orange Money\n4 - Carte bancaire'
    );

    if (!modePaiement) return;

    const modes: {[key: string]: string} = {
      '1': 'Espèces',
      '2': 'Wave',
      '3': 'Orange Money',
      '4': 'Carte bancaire'
    };

    const mode = modes[modePaiement];

    if (!mode) {

      alert('Mode de paiement invalide.');
      return;

    }

    const confirmation = window.confirm(
      `Confirmer l'encaissement de ${commande.total} FCFA par ${mode} ?`
    );

    if (!confirmation) return;

    this.commandeApi.encaisser(
      commande.numero,
      mode
    ).subscribe({

      next: () => {

        alert('Paiement enregistré avec succès !');

        this.chargerCommandes(this.donnees.page);

      },

      error: (err) => {

        console.error(err);

        alert(err.error?.message || "Erreur lors de l'encaissement.");

      }

    });

  }

}
