const creerErreur = require("../utils/creerErreur");

// Protège les routes d'écriture : il faut envoyer l'en-tête
//   x-api-key: <la clé du fichier .env>
function verifierCleApi(req, res, next) {
  if (req.get("x-api-key") !== process.env.API_KEY) {
    return next(
      creerErreur(401, "Clé API manquante ou invalide"),
    );
  }
  next();
}

module.exports = verifierCleApi;
