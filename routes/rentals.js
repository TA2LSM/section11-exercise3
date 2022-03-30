const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const auth = require("../middleware/auth");

const mongoose = require("mongoose"); // Fawn'a parametre olarak geçebilmek için require ettik yoksa gerek yoktu
//const { default: mongoose } = require("mongoose");
//var Fawn = require("fawn"); // Fawn class olduğu için ilk harfi büyük olarak yazdık

const express = require("express");
const router = express.Router();

//Fawn.init(mongoose);

// Get All Rentals
router.get("/", auth, async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.status(200).send(rentals);
});

// Create Rental
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // validate fonksiyonu dönüşünde her verinin uygunluğunun tam oalrak sağlandığından
  // emin olmak için aşağıdaki yöntem tercih edilmemiştir. DB içindeki _id'lerin
  // geçerli olduğundan emin olmak için "joi-objectid" paketi kullanılmıştır.
  // if (!mongoose.Types.ObjectId.isValid(req.body.movieId))
  //   return res.status(400).send("Movie ID is not valid!");

  // if (!mongoose.Types.ObjectId.isValid(req.body.customerId))
  //   return res.status(400).send("Customer ID is not valid!");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("The movie with the given ID was not found!");

  if (movie.numberInStock === 0) return res.status(400).send("The movie is not in stock!");

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("The customer with the given ID was not found!");

  let rental = new Rental({
    customer: {
      _id: customer._id, // buraya "_id" kaydetmemizin nedeni ileride bu müşteriye sahip olmazsak id'sini buradan görebilmek
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // (1) Fawn olmadan yazılan çözüm
  //   rental = await rental.save();
  //   // yukarıdaki .save() metodundan sonra aşağıdaki belki çalışmayabilir. mongodb bağlantısı kopabilir vs
  //   // çalıştığına emin olmak için mongoose'da "TRANSACTION" denen bir yöntemin kullanılması gerekiyor.
  //   // (Two Phase Commit)
  //   --movie.numberInStock;
  //   ++movie.dailyRentalRate;
  //   await movie.save();
  //   res.status(200).send(rental);

  // (1_1) Fawn olmadan yazılan çözüm (kurstakine ek olarak değiştirilmiştir)
  rental = await rental.save();
  if (!rental) return res.status(500).send("'Rental' task error!");

  --movie.numberInStock;
  ++movie.dailyRentalRate;
  const result = await movie.save();
  if (!result) return res.status(500).send("'Movie' task error!");

  res.status(200).send(rental);

  // (2) Fawn ile yazılan çözüm (fawn 3 yıldır güncellenmeiş kullanılması önerilmiyor / 19.03.2022)
  //var processTask = Fawn.Task(); tanımlaması yapılıp processTask.save(...) olarak da kullanılabilir.
  //   try {
  //     await new Fawn.Task()
  //       .save("rentals", rental)
  //       // direkt db'deki "rentals" koleksiyonu ile çalışıldığı için ismini buraya girmek gerekiyor. (case sensitive !!!)
  //       // koleksiyonlar küçük harf ile oluşturulur
  //       .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
  //       //.remove() ...
  //       .run();

  //     res.status(200).send(rental);
  //   } catch (ex) {
  //     res.status(500).send("Task error!");
  //     //console.log(ex);
  //   }
});

// Remove Rental
// async function removeRental(rental) {
//   await Rental.findByIdAndDelete(rental._id);
// }

module.exports = router;
