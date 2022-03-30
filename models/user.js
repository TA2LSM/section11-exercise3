const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const DEF_USER_NAME_MIN = 3;
const DEF_USER_NAME_MAX = 50;
const DEF_USER_EMAIL_MIN = 7;
const DEF_USER_EMAIL_MAX = 255;
const DEF_USER_PASSWORD_MIN = 5;
const DEF_USER_PASSWORD_MAX = 255;
const DEF_USER_PASSWORD_MAX_HASH = 1024;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: DEF_USER_NAME_MIN,
    maxlength: DEF_USER_NAME_MAX,
  },
  email: {
    type: String,
    unique: true,
    minlength: DEF_USER_EMAIL_MIN,
    maxlength: DEF_USER_EMAIL_MAX,
  },
  password: {
    type: String,
    required: true,
    minlength: DEF_USER_PASSWORD_MIN,
    maxlength: DEF_USER_PASSWORD_MAX_HASH, // hash tipi şifreleri için yüksek tutuldu
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // kullanıcı neleri yapmaya yetkili aşağıdaki şekilde de girilebilir.
  // roles: [],
  // operations: [],
});

// userSchema'ya bir metot ekliyoruz bu bir fonksiyon ismi de "generateAuthToken"
// function ( params ) şeklinde de yaratılabilir o zaman çağırırken parametre
// ile de çağrılabilir. Burada içeride "this." ile erişim olduğu için "... = function() {...}"
// yerine "... = () => {...}" KULLANILAMAZ!
// Bir objeye ait bir metot tanımlanırken "function ( params )" şeklinde tanımlamak gerekir.
userSchema.methods.generateAuthToken = function () {
  // Sırasıyla: JWT içeriğinde olacak PAYLOAD objesi{}, Public or Private Key
  // Uygulamada ASLA private key gibi gizli kalması gereken veriler kodda olmamalı
  // Bunu "environment variable" ya da json file olarak tutmak lazım.
  // config.get() ile ilgili kısmın içindeki değeri çekip burada kullanıyoruz.
  // "jwtPrivateKey" anahtar ismidir. İçeriği ise "vidly_jwtPrivateKey"dir.
  // sistemde "vidly_jwtPrivateKey" olarak tanımlı environment variable içeriği
  // alınarak kullanılacaktır...
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get("jwtPrivateKey"));
  // generateAuthToken metodu user objesinin bir parçası olduğu için _id'ye
  // erişirken "this._id" olarak erişiyoruz
  return token;
};

const User = mongoose.model("User", userSchema);

function userValidate(user) {
  const schema = {
    name: Joi.string().min(DEF_USER_NAME_MIN).max(DEF_USER_NAME_MAX).required(),
    email: Joi.string().min(DEF_USER_EMAIL_MIN).max(DEF_USER_EMAIL_MAX).required().email(),
    // email metodunu çağırarak geçerli bir email girildiğine emin oluyoruz
    password: Joi.string().min(DEF_USER_PASSWORD_MIN).max(DEF_USER_PASSWORD_MAX).required(),
    // kullanıcı 255 karaktere kadar şifre yollayacak ama biz mongodb'de bunu hash edip saklayacağız
    isAdmin: Joi.boolean(),
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = userValidate;
