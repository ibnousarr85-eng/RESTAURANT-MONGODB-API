const express = require("express");
const ctrl = require("../controllers/platController");
const verifierCleApi = require("../middlewares/verifierCleApi");

const router = express.Router();

router
  .route("/")
  .get(ctrl.listerPlats)
  .post(verifierCleApi, ctrl.creerPlat);

router
  .route("/:code")
  .get(ctrl.obtenirPlat)
  .put(verifierCleApi, ctrl.remplacerPlat)
  .patch(verifierCleApi, ctrl.modifierPlat)
  .delete(verifierCleApi, ctrl.supprimerPlat);

module.exports = router;
