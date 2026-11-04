const Plat = require("../models/Plat");
const creerErreur = require("../utils/creerErreur");

const TRIS = { nom: "nom", prix: "prix", "-prix": "-prix" };

// GET /api/plats?categorie=Plat&prixMax=3000&q=yassa
//               &tri=prix&page=1&limite=10
async function listerPlats(req, res) {
  const { categorie, q, prixMax, tri, disponible, vegetarien } =
    req.query;
  const filtre = {};

  if (categorie) filtre.categorie = categorie;
  if (q) filtre.nom = { $regex: echapper(q), $options: "i" };
  if (prixMax) {
    const max = Number(prixMax);
    if (Number.isNaN(max))
      throw creerErreur(400, "prixMax doit être un nombre");
    filtre.prix = { $lte: max };
  }
  if (disponible !== undefined)
    filtre.disponible = disponible === "true";
  if (vegetarien !== undefined)
    filtre.vegetarien = vegetarien === "true";

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limite = Math.min(
    Math.max(parseInt(req.query.limite) || 10, 1),
    50,
  );

  const [plats, total] = await Promise.all([
    Plat.find(filtre)
      .sort(TRIS[tri] || "code")
      .skip((page - 1) * limite)
      .limit(limite),
    Plat.countDocuments(filtre),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limite),
    resultats: plats,
  });
}

// GET /api/plats/:code
async function obtenirPlat(req, res) {
  const plat = await Plat.findOne({
    code: req.params.code.toUpperCase(),
  });
  if (!plat)
    throw creerErreur(404, `Plat ${req.params.code} introuvable`);
  res.json(plat);
}

// POST /api/plats
async function creerPlat(req, res) {
  const plat = await Plat.create(req.body);
  res.status(201).location(`/api/plats/${plat.code}`).json(plat);
}

// PUT /api/plats/:code : remplace tout le plat
async function remplacerPlat(req, res) {
  const code = req.params.code.toUpperCase();
  const plat = await Plat.findOneAndReplace(
    { code },
    { ...req.body, code },
    { runValidators: true, returnDocument: "after" },
  );
  if (!plat) throw creerErreur(404, `Plat ${code} introuvable`);
  res.json(plat);
}

// PATCH /api/plats/:code : modifie seulement les champs envoyés
async function modifierPlat(req, res) {
  // Le code ne se modifie pas : on le retire du corps
  const { code, ...modifications } = req.body;
  const plat = await Plat.findOneAndUpdate(
    { code: req.params.code.toUpperCase() },
    { $set: modifications },
    { runValidators: true, returnDocument: "after" },
  );
  if (!plat)
    throw creerErreur(404, `Plat ${req.params.code} introuvable`);
  res.json(plat);
}

// DELETE /api/plats/:code
async function supprimerPlat(req, res) {
  const plat = await Plat.findOneAndDelete({
    code: req.params.code.toUpperCase(),
  });
  if (!plat)
    throw creerErreur(404, `Plat ${req.params.code} introuvable`);
  res.status(204).end();
}

// Neutralise les caractères spéciaux d'une expression régulière
function echapper(texte) {
  return String(texte).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  listerPlats,
  obtenirPlat,
  creerPlat,
  remplacerPlat,
  modifierPlat,
  supprimerPlat,
};
