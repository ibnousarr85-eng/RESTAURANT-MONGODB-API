require("dotenv").config({ quiet: true });


const app = require("./app");
const connecterBase = require("./config/db");

const PORT = process.env.PORT || 3000;

connecterBase(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API sur http://localhost:${PORT}/api`),
    );
  })
  .catch((err) => {
    console.error(
      "Impossible de se connecter Ã  MongoDB :",
      err.message,
    );
    process.exit(1);
  });
