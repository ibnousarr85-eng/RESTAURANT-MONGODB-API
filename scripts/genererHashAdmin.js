const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const readline = require("readline");

function demanderMotDePasse(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    process.stdout.write(message);

    let motDePasse = "";

    process.stdin.setRawMode(true);
    process.stdin.resume();

    process.stdin.on("data", function ecouter(touche) {
      const caractere = touche.toString();

      if (caractere === "\u0003") {
        process.stdin.setRawMode(false);
        process.exit();
      }

      if (caractere === "\r" || caractere === "\n") {
        process.stdin.removeListener("data", ecouter);
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        rl.close();
        resolve(motDePasse);
      } else if (caractere === "\u007f" || caractere === "\b") {
        motDePasse = motDePasse.slice(0, -1);
      } else if (caractere >= " ") {
        motDePasse += caractere;
      }
    });
  });
}

async function main() {
  const premier = await demanderMotDePasse("Choisis ton mot de passe administrateur : ");
  const second = await demanderMotDePasse("Confirme ton mot de passe : ");

  if (premier.length < 8) {
    console.log("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  if (premier !== second) {
    console.log("Les deux mots de passe ne correspondent pas.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(premier, 12);
  const secret = crypto.randomBytes(64).toString("hex");

  const cheminEnv = path.join(__dirname, "..", ".env");
  let contenu = fs.readFileSync(cheminEnv, "utf8");

  function definirVariable(nom, valeur) {
    const expression = new RegExp("^" + nom + "=.*$", "m");

    if (expression.test(contenu)) {
      contenu = contenu.replace(expression, `${nom}=${valeur}`);
    } else {
      contenu += `\n${nom}=${valeur}`;
    }
  }

  definirVariable("ADMIN_USERNAME", "admin");
  definirVariable("ADMIN_PASSWORD_HASH", hash);
  definirVariable("JWT_SECRET", secret);

  fs.writeFileSync(cheminEnv, contenu);

  console.log("Configuration administrateur enregistrée dans .env.");
  console.log("Identifiant administrateur : admin");
  console.log("Mot de passe et clé JWT enregistrés sans être affichés.");
}

main().catch((erreur) => {
  console.error("Erreur :", erreur.message);
  process.exit(1);
});
