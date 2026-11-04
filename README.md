# baobab-api — l'API du restaurant « Le Baobab Gourmand »

Corrigé du cours « Express.js par l'exemple » (module MEAN, BEM Tech).
Express 5, Mongoose 9, MongoDB dans Docker (base `restaurant` du TP MongoDB).

## Démarrer

1. Lancer le conteneur MongoDB et vérifier que la base `restaurant` contient
   les collections `plats` (20) et `commandes` (100).
2. Dans ce dossier :

   ```
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac)
   npm run dev
   ```

3. Ouvrir http://localhost:3000 (page de la carte) et http://localhost:3000/api.

## Routes

| Méthode | Route | Clé API |
|---|---|---|
| GET | /api/plats (filtres : categorie, q, prixMax, disponible, vegetarien, tri, page, limite) | non |
| GET | /api/plats/:code | non |
| POST / PUT / PATCH / DELETE | /api/plats, /api/plats/:code | oui |
| GET | /api/commandes, /api/commandes/:numero | non |
| POST | /api/commandes | oui |
| PATCH | /api/commandes/:numero/statut | oui |
| DELETE | /api/commandes/:numero | oui |
| GET | /api/stats/chiffre-affaires, /api/stats/top-plats | non |

Clé API : en-tête `x-api-key` avec la valeur `API_KEY` du fichier `.env`.

## Tests

`npm test` (MongoDB doit tourner ; les tests utilisent la base `restaurant_test`).

## Exemples du cours

`node exemples/01-bonjour.js`, `node exemples/02-carte-en-memoire.js`,
`node exemples/03-ordre-middlewares.js`.
