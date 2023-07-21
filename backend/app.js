const express = require("express"); /*importation express*/
const mongoose = require("mongoose");

const stuffRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    "mongodb+srv://jonathanquerel:0610514524.Querel@oc-grimoire.lg97zc2.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app =
  express(); /*appel de la méthode express pour créer une appli express*/

app.use("express.json"); /*Intercepte tous les requête contenant du json */

/*Middleware pour éviter les erreurs Cors*/ app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(
  bodyParser.json()
); /* A t'on besoin de ça car il me semble que c'est pour les anciens ?*/

app.use("/api/book", stuffRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports =
  app; /*export de la constante pour pouvoir accéder depuis les autres fichiers  */
