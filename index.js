const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
const { updateAllProblems } = require("./src/UpdateProblemset");

require("dotenv/config");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/create", require("./src/AppRouter"));
app.use("/contests", require("./src/ContestRouter"));

// cron job to update problem set from codeforces API every 24 hours
cron.schedule("0 0 * * *", updateAllProblems);

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_CONNECT, () => console.log("DB connected"));

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;
