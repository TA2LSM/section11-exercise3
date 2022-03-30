const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  isGold: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    minlength: [3, "At least 3 characters needed. You entered {VALUE}"],
    maxlength: [50, "Maximum 50 characters allowed. You entered {VALUE}"],
  },
  phone: {
    type: String,
    required: true,
    minlength: [11, "Phone number must be at least 11 characters long. You entered {VALUE}"],
    maxlength: [13, "Phone number must be at maximum 13 characters long. You entered {VALUE}"],
  },
});

function validateCustomer(customer) {
  const schema = {
    name: Joi.string().min(3).required(),
    phone: Joi.string().min(11).max(13).required(),
    isGold: Joi.boolean(),
  };

  return Joi.validate(customer, schema);
}

const Customer = mongoose.model("Customer", customerSchema);

// iki şekilde de yazılabiliyor...
//module.exports.Customer = Customer;
exports.Customer = Customer;

//validateCustomer() fonksiyonunun ismini kısaltarak export eder...
exports.validate = validateCustomer;

// export edildikten sonra customer objesi 2 metoda sahip olur.
// Customer class'ı ve validate fonksiyonu. Bunlara erişmek için mesela
// customer.Customer yazmak gerekiyor. Bu da çirkin bir görüntü oluşturur.
// Bu nedenle ana kod içinde (1) ile gösterilen kısım yerine (2) ile gösterilen
// kullanılmıştır.
