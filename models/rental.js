const mongoose = require("mongoose");
const Joi = require("joi");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        isrequired: true,
        min: 2,
        max: 50,
      },
      phone: {
        type: String,
        isrequired: true,
        min: 11,
        max: 13,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
    }),
    required: true,
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateReturned: {
    // müşteri kiraladığı filmi geri getirdiğinde girilecek
    type: Date,
  },
  rentalFee: {
    // müşteri filmi geri getirdiğinde ücret hesaplanacak
    type: Number,
    min: 0,
  },
});

const Rental = mongoose.model("Rental", rentalSchema);

// client sorgusunda kullanılacak müşteri id'si ve film id'si yeterli. geri kalan bilgiler
// zaten kiralama zamanı db'e girildiği için gerekli hesaplamalar ileride server'da yapılabilir.
function validateRental(rental) {
  const schema = {
    movieId: Joi.objectId().required(),
    customerId: Joi.objectId().required(),
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
