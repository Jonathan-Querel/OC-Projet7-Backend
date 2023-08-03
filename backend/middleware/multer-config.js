const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};


// Constante storage, à passer à multer comme configuration, qui contient la logique nécessaire pour indiquer
// à multer où enregistrer les fichiers entrants.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // La fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
    // Elle a besoin de 2 arguments qui dit où on va l'enregistrer
    callback(null, "images");
    // dans destination on passe le callback avec null pour dire pas d'erreur en premier argument et le nom du deuxième argument avec le nom du fichier
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    // On stock le nom d'origine du fichier en enlevant les espaces et en les remplaçant par des _
    const extension = MIME_TYPES[file.mimetype];
    // On utilise la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
// On exporte l'élément multer entièrement configuré, on lui passe notre constante storage et on indique que nous générerons uniquement 
// les téléchargements de fichiers image.
