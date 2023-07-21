const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", auth, bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", auth, bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

/*router.get("/bestrating", (req, res, next) => {
    Book.find()
      .then((book) => res.status(200).json(book))
      .catch((error) => res.status(404).json({ error }));
  });*/

module.exports = router;
