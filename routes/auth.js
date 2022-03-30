const config = require("config");
const { User } = require("../models/user");
const Joi = require("joi");

const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const DEF_USER_EMAIL_MIN = 7;
const DEF_USER_EMAIL_MAX = 255;
const DEF_USER_PASSWORD_MIN = 5;
const DEF_USER_PASSWORD_MAX = 255;

// Login
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password!");

  // şifre kontrol kısmı
  const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
  if (!isPasswordValid) return res.status(400).send("Invalid email or password!");

  const token = user.generateAuthToken();
  res.send(token); // cevap res.body olarak dönüyor...
});

function validate(req) {
  const schema = {
    email: Joi.string().min(DEF_USER_EMAIL_MIN).max(DEF_USER_EMAIL_MAX).required().email(),
    // email metodunu çağırarak geçerli bir email girildiğine emin oluyoruz
    password: Joi.string().min(DEF_USER_PASSWORD_MIN).max(DEF_USER_PASSWORD_MAX).required(),
    // kullanıcı 255 karaktere kadar şifre yollayacak ama biz mongodb'de bunu hash edip saklayacağız
  };

  return Joi.validate(req, schema);
}

module.exports = router;
