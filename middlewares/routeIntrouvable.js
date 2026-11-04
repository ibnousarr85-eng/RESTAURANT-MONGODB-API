const creerErreur = require("../utils/creerErreur");

// Placé après toutes les routes : aucune n'a répondu
function routeIntrouvable(req, res, next) {
  next(
    creerErreur(
      404,
      `Route introuvable : ${req.method} ${req.originalUrl}`,
    ),
  );
}

module.exports = routeIntrouvable;
