// Fabrique une erreur qui porte un code HTTP (404, 400, 409…)
function creerErreur(status, message) {
  const erreur = new Error(message);
  erreur.status = status;
  return erreur;
}

module.exports = creerErreur;
