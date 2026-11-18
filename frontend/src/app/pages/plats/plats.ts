import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Produit, ReponseProduits } from '../../models/produit';
import { ProduitApi } from '../../services/produit-api';

@Component({
  selector: 'app-plats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plats.html',
  styleUrl: './plats.css'
})
export class Plats implements OnInit {

  private produitApi = inject(ProduitApi);
  private cdr = inject(ChangeDetectorRef);

  donnees!: ReponseProduits;

  chargement = false;
  erreur = '';
  succes = '';

  formulaireVisible = false;
  enregistrement = false;

  // Recherche et filtres
  recherche = '';
  categorieSelectionnee = '';
  prixMax: number | null = null;
  tri = '';
  disponible: boolean | null = null;
  vegetarien: boolean | null = null;

  // Gestion de la modification
  modeEdition = false;
  codeOriginal = '';

  nouveauPlat: Produit = {
    code: '',
    nom: '',
    categorie: 'Plat',
    prix: 0,
    vegetarien: false,
    epice: false,
    disponible: true
  };

  ngOnInit(): void {
    this.chargerPlats(1);
  }

  // Charger les plats avec tous les filtres
  chargerPlats(page: number): void {

    this.chargement = true;
    this.erreur = '';

    this.produitApi.getProduits(
      page,
      10,
      this.recherche,
      this.categorieSelectionnee,
      this.prixMax,
      this.tri,
      this.disponible,
      this.vegetarien
    ).subscribe({

      next: (reponse) => {
        this.donnees = reponse;
        this.chargement = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erreur API :', err);
        this.erreur = 'Impossible de récupérer les plats.';
        this.chargement = false;
        this.cdr.detectChanges();
      }

    });
  }

  // Lancer une recherche
  rechercherPlats(): void {
    this.chargerPlats(1);
  }

  // Réinitialiser tous les filtres
  reinitialiserFiltres(): void {
    this.recherche = '';
    this.categorieSelectionnee = '';
    this.prixMax = null;
    this.tri = '';
    this.disponible = null;
    this.vegetarien = null;

    this.chargerPlats(1);
  }

  ouvrirFormulaire(): void {
    this.modeEdition = false;
    this.reinitialiserFormulaire();

    this.formulaireVisible = true;
    this.erreur = '';
    this.succes = '';
  }

  // Charger un plat dans le formulaire
  ouvrirModification(plat: Produit): void {

    this.modeEdition = true;
    this.codeOriginal = plat.code;

    this.nouveauPlat = { ...plat };

    this.formulaireVisible = true;
    this.erreur = '';
    this.succes = '';

  }

  fermerFormulaire(): void {
    this.formulaireVisible = false;
    this.modeEdition = false;
    this.reinitialiserFormulaire();
  }

  reinitialiserFormulaire(): void {

    this.nouveauPlat = {
      code: '',
      nom: '',
      categorie: 'Plat',
      prix: 0,
      vegetarien: false,
      epice: false,
      disponible: true
    };

  }

  // Ajouter ou modifier un plat
  enregistrerPlat(): void {

    this.erreur = '';
    this.succes = '';

    if (
      !this.nouveauPlat.code.trim() ||
      !this.nouveauPlat.nom.trim() ||
      this.nouveauPlat.prix < 0
    ) {
      this.erreur = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    this.nouveauPlat.code = this.nouveauPlat.code.trim().toUpperCase();

    this.enregistrement = true;

    const operation = this.modeEdition
      ? this.produitApi.modifierProduit(this.codeOriginal, this.nouveauPlat)
      : this.produitApi.ajouterProduit(this.nouveauPlat);

    operation.subscribe({

      next: () => {

        this.enregistrement = false;
        this.formulaireVisible = false;

        this.succes = this.modeEdition
          ? 'Le plat a été modifié avec succès !'
          : 'Le plat a été ajouté avec succès !';

        this.modeEdition = false;

        this.reinitialiserFormulaire();
        this.chargerPlats(1);

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('Erreur enregistrement :', err);

        this.enregistrement = false;

        this.erreur = err.error?.message ||
          'Impossible d’enregistrer le plat. Vérifiez les informations et la clé API.';

        this.cdr.detectChanges();

      }

    });

  }

  // Ancienne méthode conservée pour compatibilité
  ajouterPlat(): void {
    this.enregistrerPlat();
  }

  // Supprimer un plat
  supprimerPlat(plat: Produit): void {

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le plat "${plat.nom}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.erreur = '';
    this.succes = '';

    this.produitApi.supprimerProduit(plat.code).subscribe({

      next: () => {
        this.succes = `Le plat "${plat.nom}" a été supprimé avec succès !`;
        this.chargerPlats(1);
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erreur suppression :', err);

        this.erreur = err.error?.message ||
          'Impossible de supprimer ce plat.';

        this.cdr.detectChanges();
      }

    });

  }

  // Changer de page
  changerPage(page: number): void {

    if (!this.donnees) return;

    if (page < 1 || page > this.donnees.pages) {
      return;
    }

    this.chargerPlats(page);
  }

}