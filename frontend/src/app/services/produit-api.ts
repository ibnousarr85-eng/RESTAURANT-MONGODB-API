import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Produit, ReponseProduits } from '../models/produit';

@Injectable({
  providedIn: 'root'
})
export class ProduitApi {

  private http = inject(HttpClient);

  private apiUrl = '/api/plats';

  // RÃ©cupÃ©rer les produits avec pagination et filtres
  getProduits(
    page: number = 1,
    limite: number = 10,
    recherche: string = '',
    categorie: string = '',
    prixMax: number | null = null,
    tri: string = '',
    disponible: boolean | null = null,
    vegetarien: boolean | null = null
  ): Observable<ReponseProduits> {

    let params = new HttpParams()
      .set('page', page)
      .set('limite', limite);

    if (recherche) params = params.set('q', recherche);
    if (categorie) params = params.set('categorie', categorie);
    if (prixMax !== null) params = params.set('prixMax', prixMax);
    if (tri) params = params.set('tri', tri);
    if (disponible !== null) params = params.set('disponible', disponible);
    if (vegetarien !== null) params = params.set('vegetarien', vegetarien);

    return this.http.get<ReponseProduits>(
      this.apiUrl,
      { params }
    );
  }

  // Ajouter un produit
  ajouterProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  // Modifier un produit
  modifierProduit(code: string, produit: Produit): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/${code}`, produit);
  }

  // Supprimer un produit
  supprimerProduit(code: string): Observable<Produit> {
    return this.http.delete<Produit>(`${this.apiUrl}/${code}`);
  }

}
