const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");
const cors = require("cors");
const { updateAllProblems } = require("./src/UpdateProblemset");

require("dotenv/config");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/create", require("./src/AppRouter"));
app.use("/contests", require("./src/ContestRouter"));

app.get("/", (req, res) => {
  res.render("home");
});

// cron job to update problem set from codeforces API every 24 hours
cron.schedule("0 0 * * *", updateAllProblems);

mongoose.connect(process.env.DB_CONNECT, () => console.log("DB connected"));

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;
