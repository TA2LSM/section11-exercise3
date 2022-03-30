const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// express-async-errors modülü ile (req, res, next) eklemeye gerek kalmadan
// hatayı "error" middleware'ine yönlendirebiliyoruz.

// Get All Genres
router.get("/", async (req, res) => {
  // winston modülünü test etmek için aşağıdaki kodu yorum olmaktan çıkartın...
  //throw new Error("Could not get the genres!");

  const genres = await Genre.find().sort("name");
  res.status(200).send(genres); // ok
});

// Create Genre
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ name: req.body.name });
  await genre.save(); //result db'e kaydedilen dökümandır. id bilgisini geri dönelim...

  res.status(200).send(genre);
});

// Update Genre
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true } //update edilmiş veriyi geri döndür...
  );

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

// Önce "auth" sonra "admin" middleware'i çalışacak
// Delete Genre by ID
router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

// Find Genre by ID
router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

module.exports = router;
