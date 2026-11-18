import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Commande } from '../models/commande';
import { Page } from '../models/page';

export interface NouvelleCommande {
  type: string;

  client: {
    prenom: string;
    nom: string;
  };

  serveur: string;

  table?: number;
  nbCouverts?: number;
  quartier?: string;

  lignes: {
    code: string;
    quantite: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CommandeApi {

  private http = inject(HttpClient);

  private apiUrl = '/api/commandes';

  getCommandes(
    page: number = 1,
    statut: string = ''
  ): Observable<Page<Commande>> {

    let params = new HttpParams().set('page', page);

    if (statut) {
      params = params.set('statut', statut);
    }

    return this.http.get<Page<Commande>>(
      this.apiUrl,
      { params }
    );
  }

  getCommande(numero: string): Observable<Commande> {

    return this.http.get<Commande>(
      `${this.apiUrl}/${numero}`
    );
  }

  encaisser(
    numero: string,
    modePaiement: string
  ): Observable<Commande> {

    return this.http.patch<Commande>(
      `${this.apiUrl}/${numero}/statut`,
      {
        statut: 'Payée',
        modePaiement: modePaiement
      }
    );
  }

  creerCommande(
    commande: NouvelleCommande
  ): Observable<Commande> {

    return this.http.post<Commande>(
      this.apiUrl,
      commande
    );
  }

}
