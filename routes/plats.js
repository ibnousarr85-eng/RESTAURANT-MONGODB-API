const express = require("express");
const ctrl = require("../controllers/platController");
const verifierAdmin = require("../middlewares/verifierAdmin");

const router = express.Router();

router
  .route("/")
  .get(ctrl.listerPlats)
  .post(verifierAdmin, ctrl.creerPlat);

router
  .route("/:code")
  .get(ctrl.obtenirPlat)
  .put(verifierAdmin, ctrl.remplacerPlat)
  .patch(verifierAdmin, ctrl.modifierPlat)
  .delete(verifierAdmin, ctrl.supprimerPlat);

module.exports = router;
