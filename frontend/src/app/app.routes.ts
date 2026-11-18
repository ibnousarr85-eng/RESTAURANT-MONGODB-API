import { Routes } from '@angular/router';

import { Accueil } from './pages/accueil/accueil';
import { Connexion } from './pages/connexion/connexion';
import { Dashboard } from './pages/dashboard/dashboard';
import { Commandes } from './pages/commandes/commandes';
import { Plats } from './pages/plats/plats';
import { Catalogue } from './pages/catalogue/catalogue';
import { Panier as PanierPage } from './pages/panier/panier';

import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Accueil },

  { path: 'connexion', component: Connexion },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminGuard]
  },
  { path: 'catalogue', component: Catalogue },
  { path: 'panier', component: PanierPage },

  {
    path: 'commandes',
    component: Commandes,
    canActivate: [adminGuard]
  },
  {
    path: 'plats',
    component: Plats,
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '' }
];
