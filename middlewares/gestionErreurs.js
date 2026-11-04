// 4 paramètres : Express reconnaît un gestionnaire d'erreurs
function gestionErreurs(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let details;

  if (err.name === "ValidationError") {
    // règles du schéma non respectées
    status = 400;
    message = "Données invalides";
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    // ex. prix: "abc"
    status = 400;
    message = `Valeur invalide pour ${err.path}`;
  } else if (err.code === 11000) {
    // clé unique déjà utilisée
    status = 409;
    message = `Déjà existant : ${JSON.stringify(err.keyValue)}`;
  } else if (err.type === "entity.parse.failed") {
    // JSON mal formé
    status = 400;
    message = "Le corps de la requête n'est pas un JSON valide";
  }

  // Les détails techniques restent dans le terminal
  if (status === 500) console.error(err);
  res
    .status(status)
    .json({
      erreur:
        status === 500 ? "Erreur interne du serveur" : message,
      details,
    });
}

module.exports = gestionErreurs;
