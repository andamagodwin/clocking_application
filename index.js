require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/router");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY;


app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);


app.use("/", routes);

mongoose
  .connect(databaseUrl,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("connected to db");
    app.listen(port, () => {
      console.log("Listening on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
