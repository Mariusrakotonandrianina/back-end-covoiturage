const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const router = require("./Route/router.js");
const app = express();
const port = process.env.PORT;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecté avec succès à la base de données MongoDB!");
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err.message);
    process.exit(1);
  }
};

const corsOptions = {
  origin: [
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3003",
  ],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  Credential: true,
  optionsSuccessStatus: 204,
};

app.locals.stripe = stripe;

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  connect();
  console.log(`Server is running at http://localhost:${port}`);
});
