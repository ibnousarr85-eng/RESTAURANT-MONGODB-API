export interface Produit {
  _id?: string;
  code: string;
  nom: string;
  description?: string;
  categorie: 'Entrée' | 'Plat' | 'Dessert' | 'Boisson';
  prix: number;
  vegetarien: boolean;
  epice: boolean;
  disponible: boolean;
}

export interface ReponseProduits {
  total: number;
  page: number;
  pages: number;
  resultats: Produit[];
}
