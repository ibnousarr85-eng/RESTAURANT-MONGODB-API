const mongoose = require("mongoose");

async function connecterBase(uri) {
  mongoose.connection.on("connected", () =>
    console.log("MongoDB connecté"),
  );
  mongoose.connection.on("error", (err) =>
    console.error("Erreur MongoDB :", err.message),
  );
  mongoose.connection.on("disconnected", () =>
    console.log("MongoDB déconnecté"),
  );

  await mongoose.connect(uri);
}

module.exports = connecterBase;
