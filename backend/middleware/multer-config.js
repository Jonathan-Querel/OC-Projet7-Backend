const multer = require("multer");
const SharpMulter = require("sharp-multer");

//package sharpMulter
const storage = SharpMulter({
  destination: (req, file, callback) => {
    // La fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
    // Elle a besoin de 2 arguments qui dit où on va l'enregistrer
    callback(null, "images");
    // dans destination on passe le callback avec null pour dire pas d'erreur en premier argument et le nom du deuxième argument avec le nom du fichier
  },
  imageOptions: {
    fileFormat: "webp",
    quality: 80,
    resize: {
      width: 206,
      height: 260,
      resizeMode: "contain",
    }, // Définit les options de l'image.
    // Taille de la propriété ".BookItem_BookImage" de l'application react
  },
});

module.exports = multer({ storage }).single("image");
// On exporte l'élément multer entièrement configuré, on lui passe notre constante storage et on indique que nous générerons uniquement
// les téléchargements de fichiers image.
