const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Problem = require("./models/Problem");
const axios = require("axios");
const path = require("path");
require("dotenv/config");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const queryRoute = require("./routes");
app.use("/q", queryRoute);

app.get("/", async (req, res) => {
  // run once a day
  // try {
  //   const response = await axios.get(
  //     "https://codeforces.com/api/problemset.problems"
  //   );
  //   const problems = response.data.result.problems;
  //   for (let problemRating = 800; problemRating <= 3500; problemRating += 100) {
  //     const p = new Problem({
  //       rating: problemRating,
  //       problems: [],
  //     });
  //     for (const problem of problems) {
  //       if (problem.rating === problemRating) {
  //         p.problems.push({
  //           contestId: problem.contestId,
  //           index: problem.index,
  //           name: problem.name,
  //         });
  //       }
  //     }
  //     await Problem.deleteOne({ rating: problemRating });
  //     await p.save();
  //   }
  // } catch (err) {
  //   console.log(err);
  // }
  res.render("home");
});

mongoose.connect(process.env.DB_CONNECT, () => console.log("DB connected"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;
