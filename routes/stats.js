const express = require("express");

const {
  chiffreAffaires,
  topPlats,
} = require("../controllers/statsController");

const verifierAdmin = require("../middlewares/verifierAdmin");

const router = express.Router();

router.get("/chiffre-affaires", verifierAdmin, chiffreAffaires);
router.get("/top-plats", verifierAdmin, topPlats);

module.exports = router;
