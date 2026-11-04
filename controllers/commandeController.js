const Commande = require("../models/Commande");
const Plat = require("../models/Plat");
const creerErreur = require("../utils/creerErreur");

const FRAIS_LIVRAISON = 1000;

// GET /api/commandes?statut=Payée&type=Livraison&page=1
async function listerCommandes(req, res) {
  const { statut, type, serveur } = req.query;
  const filtre = {};
  if (statut) filtre.statut = statut;
  if (type) filtre.type = type;
  if (serveur) filtre.serveur = serveur;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limite = 20;

  const [commandes, total] = await Promise.all([
    Commande.find(filtre)
      .select("numero date type client serveur total statut")
      .sort({ date: -1 })
      .skip((page - 1) * limite)
      .limit(limite),
    Commande.countDocuments(filtre),
  ]);
  res.json({
    total,
    page,
    pages: Math.ceil(total / limite),
    resultats: commandes,
  });
}

// GET /api/commandes/:numero
async function obtenirCommande(req, res) {
  const commande = await Commande.findOne({
    numero: req.params.numero,
  });
  if (!commande)
    throw creerErreur(
      404,
      `Commande ${req.params.numero} introuvable`,
    );
  res.json(commande);
}

// POST /api/commandes
// Corps : { type, client: {prenom, nom}, serveur, table?,
//          nbCouverts?, quartier?,
//          lignes: [ { code: "P02", quantite: 2 }, … ] }
async function creerCommande(req, res) {
  const {
    type,
    client,
    serveur,
    table,
    nbCouverts,
    quartier,
    lignes,
  } = req.body;
  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw creerErreur(
      400,
      "La commande doit contenir au moins une ligne",
    );
  }

  // 1. Récupérer les plats demandés en UNE requête
  const codes = lignes.map((l) => String(l.code).toUpperCase());
  const plats = await Plat.find({ code: { $in: codes } });
  const parCode = new Map(plats.map((p) => [p.code, p]));

  // 2. Les lignes, au prix de la carte (jamais celui du client)
  const lignesCommande = lignes.map((ligne) => {
    const plat = parCode.get(String(ligne.code).toUpperCase());
    if (!plat)
      throw creerErreur(400, `Plat inconnu : ${ligne.code}`);
    if (!plat.disponible)
      throw creerErreur(409, `Plat indisponible : ${plat.nom}`);
    const quantite = parseInt(ligne.quantite) || 1;
    return {
      code: plat.code,
      nom: plat.nom,
      categorie: plat.categorie,
      prixUnitaire: plat.prix,
      quantite,
    };
  });

  // 3. Calculer le total côté serveur
  let total = lignesCommande.reduce(
    (somme, l) => somme + l.prixUnitaire * l.quantite,
    0,
  );
  const livraison =
    type === "Livraison"
      ? { quartier, frais: FRAIS_LIVRAISON }
      : undefined;
  if (livraison) total += FRAIS_LIVRAISON;

  // 4. Numéro suivant : CMD-101, CMD-102…
  const derniere = await Commande.findOne()
    .sort({ numero: -1 })
    .select("numero");
  const suivant = derniere
    ? parseInt(derniere.numero.slice(4)) + 1
    : 1;
  const numero = `CMD-${String(suivant).padStart(3, "0")}`;

  const commande = await Commande.create({
    numero,
    type,
    client,
    serveur,
    table,
    nbCouverts,
    livraison,
    plats: lignesCommande,
    total,
    statut: "En cours",
  });
  res
    .status(201)
    .location(`/api/commandes/${numero}`)
    .json(commande);
}

// PATCH /api/commandes/:numero/statut
// Corps : { statut, modePaiement? }
async function changerStatut(req, res) {
  const { statut, modePaiement } = req.body;
  if (statut === "Payée" && !modePaiement) {
    throw creerErreur(
      400,
      "modePaiement est obligatoire pour une commande payée",
    );
  }
  const commande = await Commande.findOneAndUpdate(
    { numero: req.params.numero },
    { $set: { statut, ...(modePaiement && { modePaiement }) } },
    { runValidators: true, returnDocument: "after" },
  );
  if (!commande)
    throw creerErreur(
      404,
      `Commande ${req.params.numero} introuvable`,
    );
  res.json(commande);
}

// DELETE /api/commandes/:numero : interdit pour une commande payée
async function supprimerCommande(req, res) {
  const commande = await Commande.findOne({
    numero: req.params.numero,
  });
  if (!commande)
    throw creerErreur(
      404,
      `Commande ${req.params.numero} introuvable`,
    );
  if (commande.statut === "Payée") {
    throw creerErreur(
      409,
      "Une commande payée ne peut pas être supprimée",
    );
  }
  await commande.deleteOne();
  res.status(204).end();
}

module.exports = {
  listerCommandes,
  obtenirCommande,
  creerCommande,
  changerStatut,
  supprimerCommande,
};
