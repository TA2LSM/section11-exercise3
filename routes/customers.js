// (1)
//const customer = require("../models/customer");
// (2)
const { Customer, validate } = require("../models/customer");

//const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Get All Customers
router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.status(200).send(customers);
});

// Create Customer
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  await customer.save(); //result db'e kaydedilen dökümandır. id bilgisini geri dönelim...

  res.status(200).send(customer);
});

// Update Customer
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true } //update edilmiş veriyi geri döndür...
  );

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

// Delete Customer by ID
router.delete("/:id", async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

// Find Customer by ID
router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

module.exports = router;
