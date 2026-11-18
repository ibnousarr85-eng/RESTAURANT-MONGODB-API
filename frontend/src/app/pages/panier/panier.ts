import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Panier as PanierService, LignePanier } from '../../services/panier';
import { CommandeApi, NouvelleCommande } from '../../services/commande-api';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.html',
  styleUrl: './panier.css'
})
export class Panier implements OnInit {

  private panierService = inject(PanierService);
  private commandeApi = inject(CommandeApi);

  lignes: LignePanier[] = [];

  formulaireVisible = false;
  chargement = false;
  message = '';
  erreur = '';

  client = {
    prenom: '',
    nom: '',
    type: 'Sur place',
    quartier: '',
    table: 1,
    nbCouverts: 1
  };

  ngOnInit(): void {
    this.panierService.lignes$.subscribe(lignes => {
      this.lignes = lignes;
    });
  }

  augmenter(code: string): void {
    const ligne = this.lignes.find(
      item => item.produit.code === code
    );

    if (ligne) {
      this.panierService.modifierQuantite(
        code,
        ligne.quantite + 1
      );
    }
  }

  diminuer(code: string): void {
    const ligne = this.lignes.find(
      item => item.produit.code === code
    );

    if (ligne) {
      this.panierService.modifierQuantite(
        code,
        ligne.quantite - 1
      );
    }
  }

  supprimer(code: string): void {
    this.panierService.retirer(code);
  }

  viderPanier(): void {
    this.panierService.vider();
  }

  afficherFormulaire(): void {
    if (this.lignes.length === 0) {
      return;
    }

    this.formulaireVisible = true;
    this.message = '';
    this.erreur = '';
  }

  annulerValidation(): void {
    this.formulaireVisible = false;
  }

  validerCommande(): void {

    this.erreur = '';
    this.message = '';

    if (!this.client.prenom.trim() || !this.client.nom.trim()) {
      this.erreur = 'Veuillez renseigner votre prénom et votre nom.';
      return;
    }

    if (this.client.type === 'Livraison' && !this.client.quartier.trim()) {
      this.erreur = 'Veuillez renseigner votre quartier.';
      return;
    }

    if (this.lignes.length === 0) {
      this.erreur = 'Votre panier est vide.';
      return;
    }

    const nouvelleCommande: NouvelleCommande = {
      type: this.client.type,
      client: {
        prenom: this.client.prenom.trim(),
        nom: this.client.nom.trim()
      },
      serveur: 'Commande en ligne',
      lignes: this.lignes.map(ligne => ({
        code: ligne.produit.code,
        quantite: ligne.quantite
      }))
    };

    if (this.client.type === 'Sur place') {
      nouvelleCommande.table = this.client.table;
      nouvelleCommande.nbCouverts = this.client.nbCouverts;
    }

    if (this.client.type === 'Livraison') {
      nouvelleCommande.quartier = this.client.quartier.trim();
    }

    this.chargement = true;

    this.commandeApi.creerCommande(nouvelleCommande).subscribe({
      next: (commande) => {
        this.panierService.vider();
        this.formulaireVisible = false;
        this.chargement = false;
        this.message = `Commande ${commande.numero} enregistrée avec succès !`;
        this.client.prenom = '';
        this.client.nom = '';
        this.client.quartier = '';
      },

      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Impossible de créer la commande. Veuillez réessayer.';
      }
    });
  }

  get total(): number {
    return this.panierService.montantTotal;
  }

  get nombreArticles(): number {
    return this.panierService.nombreArticles;
  }
}