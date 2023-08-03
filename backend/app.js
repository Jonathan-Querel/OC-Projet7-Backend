require("dotenv").config();
const cors = require("cors");
const express = require("express"); /*importation express*/
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    "mongodb+srv://jonathanquerel:0610514524.Querel@oc-grimoire.lg97zc2.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();
// Permet de créer une application express

// Middleware générale exécuté dans notre code pour rajouter des header et
// donner les autorisations pour les requêtes en toutes sécurité
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Permet d'accéder à notre API depuis n'importe quelle origine ('*')
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    // Permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    // Permet d'envoyer des requêtes avec les méthodes menthionnées
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
// export de la constante pour pouvoir accéder depuis les autres fichiers
