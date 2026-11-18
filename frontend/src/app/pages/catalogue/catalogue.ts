import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Produit } from '../../models/produit';
import { ProduitApi } from '../../services/produit-api';
import { Panier } from '../../services/panier';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogue.html',
  styleUrl: './catalogue.css'
})
export class Catalogue implements OnInit, OnDestroy {
  private produitApi = inject(ProduitApi);
  private cdr = inject(ChangeDetectorRef);
  private panier = inject(Panier);
  private rechercheTimer: ReturnType<typeof setTimeout> | undefined;
  private confirmationTimer: ReturnType<typeof setTimeout> | undefined;

  produits: Produit[] = [];
  recherche = '';
  categorieSelectionnee = '';
  disponibilite = '';
  page = 1;
  pages = 1;
  total = 0;
  chargement = true;
  erreur = '';
  nombreArticles = 0;
  ajoutMessage = '';

  ngOnInit(): void {
    this.chargerProduits();
    this.panier.lignes$.subscribe(() => {
      this.nombreArticles = this.panier.nombreArticles;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.rechercheTimer) clearTimeout(this.rechercheTimer);
    if (this.confirmationTimer) clearTimeout(this.confirmationTimer);
  }

  rechercheChangee(): void {
    if (this.rechercheTimer) clearTimeout(this.rechercheTimer);
    if (this.recherche.trim().length === 1) return;
    this.rechercheTimer = setTimeout(() => this.chargerProduits(1), 400);
  }

  chargerProduits(page: number = 1): void {
    this.chargement = true;
    this.erreur = '';
    const disponible = this.disponibilite === '' ? null : this.disponibilite === 'true';
    this.produitApi.getProduits(page, 8, this.recherche.trim(), this.categorieSelectionnee,
      null, '', disponible, null).subscribe({
      next: reponse => {
        this.produits = reponse.resultats;
        this.page = reponse.page;
        this.pages = reponse.pages;
        this.total = reponse.total;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erreur catalogue :', err);
        this.erreur = 'Impossible de récupérer les plats. Vérifiez votre connexion puis réessayez.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  appliquerFiltres(): void {
    if (this.recherche.trim().length === 1) return;
    this.chargerProduits(1);
  }

  selectionnerCategorie(categorie: string): void {
    this.categorieSelectionnee = categorie;
    this.chargerProduits(1);
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.categorieSelectionnee = '';
    this.disponibilite = '';
    if (this.rechercheTimer) clearTimeout(this.rechercheTimer);
    this.chargerProduits(1);
  }

  changerPage(page: number): void {
    if (page < 1 || page > this.pages) return;
    this.chargerProduits(page);
  }

  ajouterAuPanier(produit: Produit): void {
    this.panier.ajouter(produit);
    this.nombreArticles = this.panier.nombreArticles;
    this.ajoutMessage = `${produit.nom} ajouté au panier`;
    if (this.confirmationTimer) clearTimeout(this.confirmationTimer);
    this.confirmationTimer = setTimeout(() => {
      this.ajoutMessage = '';
      this.cdr.detectChanges();
    }, 3200);
    this.cdr.detectChanges();
  }

  imageProduit(code: string): string {
    return `assets/images/plats/${code}.${code === 'P09' ? 'png' : 'jpg'}`;
  }

  imageIndisponible(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';
    const illustration = image.parentElement?.querySelector('.illustration') as HTMLElement | null;
    if (illustration) illustration.hidden = false;
  }
}
