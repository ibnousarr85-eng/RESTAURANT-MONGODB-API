import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit';

export interface LignePanier {
  produit: Produit;
  quantite: number;
}

@Injectable({
  providedIn: 'root'
})
export class Panier {

  private readonly cleStockage = 'baobab_panier';

  private lignesSubject = new BehaviorSubject<LignePanier[]>(
    this.chargerPanier()
  );

  lignes$ = this.lignesSubject.asObservable();

  get lignes(): LignePanier[] {
    return this.lignesSubject.value;
  }

  ajouter(produit: Produit): void {
    if (!produit.disponible) {
      return;
    }

    const panier = [...this.lignes];
    const ligne = panier.find(
      item => item.produit.code === produit.code
    );

    if (ligne) {
      ligne.quantite++;
    } else {
      panier.push({
        produit,
        quantite: 1
      });
    }

    this.mettreAJour(panier);
  }

  modifierQuantite(code: string, quantite: number): void {
    const panier = this.lignes
      .map(ligne =>
        ligne.produit.code === code
          ? { ...ligne, quantite }
          : ligne
      )
      .filter(ligne => ligne.quantite > 0);

    this.mettreAJour(panier);
  }

  retirer(code: string): void {
    const panier = this.lignes.filter(
      ligne => ligne.produit.code !== code
    );

    this.mettreAJour(panier);
  }

  vider(): void {
    this.mettreAJour([]);
  }

  get nombreArticles(): number {
    return this.lignes.reduce(
      (total, ligne) => total + ligne.quantite,
      0
    );
  }

  get montantTotal(): number {
    return this.lignes.reduce(
      (total, ligne) =>
        total + ligne.produit.prix * ligne.quantite,
      0
    );
  }

  private mettreAJour(panier: LignePanier[]): void {
    this.lignesSubject.next(panier);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.cleStockage,
        JSON.stringify(panier)
      );
    }
  }

  private chargerPanier(): LignePanier[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const donnees = localStorage.getItem(this.cleStockage);
      return donnees ? JSON.parse(donnees) : [];
    } catch {
      return [];
    }
  }
}