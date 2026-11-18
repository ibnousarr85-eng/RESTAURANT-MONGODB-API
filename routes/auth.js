const express = require("express");
const ctrl = require("../controllers/authController");
const verifierAdmin = require("../middlewares/verifierAdmin");

const router = express.Router();

router.post("/login", ctrl.connecter);
router.get("/me", verifierAdmin, ctrl.verifierSession);
router.post("/logout", verifierAdmin, ctrl.deconnecter);

module.exports = router;
