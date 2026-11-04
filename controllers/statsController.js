const Commande = require("../models/Commande");

// GET /api/stats/chiffre-affaires
async function chiffreAffaires(req, res) {
  const parPaiement = await Commande.aggregate([
    { $match: { statut: "Payée" } },
    {
      $group: {
        _id: "$modePaiement",
        total: { $sum: "$total" },
        commandes: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  const total = parPaiement.reduce(
    (somme, ligne) => somme + ligne.total,
    0,
  );
  res.json({ total, parPaiement });
}

// GET /api/stats/top-plats?limite=5
async function topPlats(req, res) {
  const limite = Math.min(parseInt(req.query.limite) || 5, 20);
  const top = await Commande.aggregate([
    { $match: { statut: { $ne: "Annulée" } } },
    { $unwind: "$plats" },
    {
      $group: {
        _id: "$plats.nom",
        quantite: { $sum: "$plats.quantite" },
        recette: {
          $sum: {
            $multiply: ["$plats.prixUnitaire", "$plats.quantite"],
          },
        },
      },
    },
    { $sort: { quantite: -1, _id: 1 } },
    { $limit: limite },
  ]);
  res.json(top);
}

module.exports = { chiffreAffaires, topPlats };
