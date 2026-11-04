const mongoose = require("mongoose");

const platSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Le code est obligatoire"],
      unique: true,
      uppercase: true,
      match: [/^P\d{2,}$/, "Le code doit ressembler à P01"],
    },
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    categorie: {
      type: String,
      required: [true, "La catégorie est obligatoire"],
      enum: {
        values: ["Entrée", "Plat", "Dessert", "Boisson"],
        message: "Catégorie inconnue : {VALUE}",
      },
    },
    prix: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    vegetarien: { type: Boolean, default: false },
    epice: { type: Boolean, default: false },
    disponible: { type: Boolean, default: true },
  },
  { versionKey: false },
);

module.exports = mongoose.model("Plat", platSchema);
