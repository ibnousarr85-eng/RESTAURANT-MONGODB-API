// Tests de l'API : node --test   (MongoDB doit tourner)
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

process.env.API_KEY = "cle-de-test";
const app = require("../app");
const Plat = require("../models/Plat");
const Commande = require("../models/Commande");

let serveur;
let base;
const CLE = { "x-api-key": "cle-de-test", "Content-Type": "application/json" };

before(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/restaurant_test");
  await mongoose.connection.dropDatabase();
  await Plat.syncIndexes();
  await Commande.syncIndexes();
  await Plat.create([
    { code: "P01", nom: "Thiéboudienne", categorie: "Plat", prix: 3500 },
    { code: "P07", nom: "Caldou", categorie: "Plat", prix: 3500, disponible: false },
    { code: "P17", nom: "Bissap", categorie: "Boisson", prix: 500, vegetarien: true },
  ]);
  serveur = app.listen(0);                        // port libre choisi par le système
  base = `http://localhost:${serveur.address().port}`;
});

after(async () => {
  serveur.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("GET /api/plats renvoie la liste paginée", async () => {
  const reponse = await fetch(`${base}/api/plats`);
  assert.equal(reponse.status, 200);
  const corps = await reponse.json();
  assert.equal(corps.total, 3);
  assert.deepEqual(corps.resultats.map((p) => p.code), ["P01", "P07", "P17"]);
});

test("GET /api/plats filtre par catégorie et prix maximum", async () => {
  const corps = await (await fetch(`${base}/api/plats?categorie=Boisson&prixMax=1000`)).json();
  assert.deepEqual(corps.resultats.map((p) => p.nom), ["Bissap"]);
});

test("GET /api/plats/:code renvoie 404 pour un plat inconnu", async () => {
  const reponse = await fetch(`${base}/api/plats/P99`);
  assert.equal(reponse.status, 404);
});

test("POST /api/plats exige la clé API", async () => {
  const reponse = await fetch(`${base}/api/plats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "P21", nom: "Ndambé", categorie: "Entrée", prix: 1000 }),
  });
  assert.equal(reponse.status, 401);
});

test("POST /api/plats crée un plat (201) puis refuse un doublon (409)", async () => {
  const plat = { code: "P21", nom: "Ndambé", categorie: "Entrée", prix: 1000 };
  const creation = await fetch(`${base}/api/plats`, { method: "POST", headers: CLE, body: JSON.stringify(plat) });
  assert.equal(creation.status, 201);
  assert.equal(creation.headers.get("location"), "/api/plats/P21");
  const doublon = await fetch(`${base}/api/plats`, { method: "POST", headers: CLE, body: JSON.stringify(plat) });
  assert.equal(doublon.status, 409);
});

test("POST /api/plats renvoie 400 et la liste des erreurs", async () => {
  const reponse = await fetch(`${base}/api/plats`, {
    method: "POST", headers: CLE, body: JSON.stringify({ code: "21", categorie: "Soupe", prix: -5 }),
  });
  assert.equal(reponse.status, 400);
  const corps = await reponse.json();
  assert.ok(corps.details.includes("Le nom est obligatoire"));
  assert.ok(corps.details.includes("Catégorie inconnue : Soupe"));
});

test("PATCH /api/plats/:code ne modifie que les champs envoyés", async () => {
  const reponse = await fetch(`${base}/api/plats/P17`, { method: "PATCH", headers: CLE, body: JSON.stringify({ prix: 600 }) });
  const plat = await reponse.json();
  assert.equal(plat.prix, 600);
  assert.equal(plat.vegetarien, true);
});

test("POST /api/commandes calcule le total côté serveur", async () => {
  const reponse = await fetch(`${base}/api/commandes`, {
    method: "POST", headers: CLE,
    body: JSON.stringify({
      type: "Livraison", client: { prenom: "Awa", nom: "Sarr" }, serveur: "Astou", quartier: "Mermoz",
      lignes: [{ code: "P01", quantite: 2 }, { code: "P17", quantite: 1, prixUnitaire: 1 }],
    }),
  });
  assert.equal(reponse.status, 201);
  const commande = await reponse.json();
  assert.equal(commande.numero, "CMD-001");
  assert.equal(commande.total, 3500 * 2 + 600 + 1000); // + frais de livraison
});

test("POST /api/commandes refuse un plat indisponible (409)", async () => {
  const reponse = await fetch(`${base}/api/commandes`, {
    method: "POST", headers: CLE,
    body: JSON.stringify({ type: "Sur place", client: { prenom: "A", nom: "B" }, serveur: "Dior", lignes: [{ code: "P07" }] }),
  });
  assert.equal(reponse.status, 409);
});

test("une commande payée ne peut pas être supprimée", async () => {
  await fetch(`${base}/api/commandes/CMD-001/statut`, {
    method: "PATCH", headers: CLE, body: JSON.stringify({ statut: "Payée", modePaiement: "Wave" }),
  });
  const reponse = await fetch(`${base}/api/commandes/CMD-001`, { method: "DELETE", headers: CLE });
  assert.equal(reponse.status, 409);
});

test("une route inconnue renvoie 404 en JSON", async () => {
  const reponse = await fetch(`${base}/api/menu`);
  assert.equal(reponse.status, 404);
  assert.match((await reponse.json()).erreur, /Route introuvable/);
});
