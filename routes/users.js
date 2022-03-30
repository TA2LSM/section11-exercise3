const { User, validate } = require("../models/user");
const _ = require("lodash");

const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const auth = require("../middleware/auth");

// Get All Users
router.get("/", async (req, res) => {
  const users = await User.find().sort("name");
  res.status(200).send(users);
});

// "/:id" şeklinde bir route kullanılmadı çünkü bu, kolayca bir başkasının ilgili
// kullanıcının kayıtlı id'sini öğrenmesi demek. Bunun yerine "jwt" kullanılacak
// ve api route'u olarak da aşağıdaki yaklaşım kullanıldı.
router.get("/me", auth, async (req, res) => {
  // auth middleware'inden döndüğümüzde bu kısma giriş yapmış oluruz.
  // burada elimizde req.user objesi olacak. (jwt'dan decode edildiği için)
  // dolayısıyla req.user._id olarak direkt erişebiliriz.

  // sondaki select() metodu ile password HARİÇ geri kalan bilgileri seçiyoruz.
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
});

// Create User
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered!");

  // şifre hash'leme kısmı
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send(_.pick(user, ["_id", "name", "email"]));
  //Aşağıdaki şekilde de yazılabilir. "Authorization" kısmı altına token gelecektir.
  //res.header("Authorization", token).send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
