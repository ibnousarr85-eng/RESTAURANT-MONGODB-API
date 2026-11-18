export interface LigneCommande {
  code: string;
  nom: string;
  categorie: string;
  prixUnitaire: number;
  quantite: number;
}

export interface Commande {
  _id?: string;
  numero: string;
  date: string;
  type: string;

  client: {
    prenom: string;
    nom: string;
  };

  serveur: string;

  plats?: LigneCommande[];

  total: number;

  statut: 'En cours' | 'Payée' | 'Annulée';

  table?: number;
  nbCouverts?: number;

  modePaiement?: string;
}