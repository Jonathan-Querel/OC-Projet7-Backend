const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  // Avec la fonction parse de JSON on parse l'objet requête car cet objet nous ai envoyé en string
  delete bookObject._id;
  delete bookObject._userId;
  // On supprime 2 champs de l'objet qui nous ai renvoyé.
  // l'id est généré automatiquement par notre base de donnée
  // On ne fait pas confiance au client alors on supprime l'UserId et on va le remplacer par celui du token
  const book = new Book({
    // On créé l'objet avec notre nouveau book
    ...bookObject,
    // Opérateur de déversement = pour déverser les propriétés de bookObject dans l'objet du livre
    userId: req.auth.userId,
    // On remplace le userId avec le token d'authentification
    imageUrl: `${req.protocol}://${req.get(`host`)}/images/${
      // multer nous passe que le nom de fichier donc on doit le générer nous même
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  // 2 possibilité = l'user à mis à jour l'image ou non
  // Si oui, nous recevrons l'élément form-data et le fichier
  // Si non, nous recevrons uniquement les données JSON
  const bookObject = req.file
    ? // Objet file (image) ou non ? Si oui, on récupère notre objet en parsant la string et en recréant l'url de l'image comme précédemment
      {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // Si pas de fichier de transmis, on récupère simplement l'objet dans le corps de la requête

  delete bookObject._userId;
  // On supprime de nouveau l'user Id par sécurité
  Book.findOne({ _id: req.params.id })
    // méthode findOne pour trouver livre dans la BDD : critère de recherche est l'ID du livre
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // vérifie bon utilisateur (compare userId du token et celui de notre base)
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // utilisateur autorisé à modifié avec la méthode updateOne pour mettre à jour le livre dans la base de données.

        // http://localhost:4000/images/Zero_to_One.png1691689438783.webp
        // filename = ['http://localhost:4000', 'Zero_to_One.png1691689438783.webp']

        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Livre modifié !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  // On doit vérifier les droits d'autorisation comme on l'a faire pour le chemin PUT
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        // extraction du nom du fichier d'image à partir de l'url de l'image du livre
        fs.unlink(`images/${filename}`, () => {
          // Fonction fs.unlink pour supprimer le fichier d'image du système de fichier
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Libre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  // Méthode findOne permet de trouver un seul document correspondant aux critère de recherche
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find({})
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// -------------------------------------------------------RATINGS --------------------------------

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri par ordre décroissant de la note moyenne
    .limit(3) // Limite à 3 résultats
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.addRating = async (req, res, next) => {
  const ratingObject = req.body;
  ratingObject.grade = ratingObject.rating;
  delete ratingObject.rating;

  try {
    const book = await Book.findOne({ _id: req.params.id }); // on récupere le livre

    if (book.ratings.find((r) => r.userId === req.auth.userId)) {
      // on compare si l'utilisateur a déjà noté le livre
      res.status(400).json({ message: "Vous avez déjà noté ce livre." }); // si oui, on renvoie une erreur
    } else {
      // si non, on ajoute la note
      const updatedBook = await Book.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { ratings: ratingObject }, //  met ratings dans le tableau
          $inc: { totalRatings: 1 }, // ça rajoute un champs
        },
        { new: true } //autorise la création si le champ n'existe pas dans la base (update transforme en POST)
      );

      let averageRates = 0;
      for (let i = 0; i < updatedBook.ratings.length; i++) {
        averageRates += updatedBook.ratings[i].grade;
      }
      averageRates /= updatedBook.ratings.length;

      const bookWithAverageRating = await Book.findOneAndUpdate(
        { _id: req.params.id },
        { averageRating: averageRates },
        { new: true }
      );

      res.status(201).json(bookWithAverageRating);
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
