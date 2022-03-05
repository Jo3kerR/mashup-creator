const express = require("express");
const router = express.Router();
const Contest = require("./models/Contest");
const { getContestLink } = require("./createMashup");
const { unsolvedIds } = require("./unsolved");

router.get("/", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ _id: -1 }).limit(1);
    const lastContestNumber = contests[0].contestNumber + 1;
    res.json(lastContestNumber);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/", async (req, res) => {
  let users = req.body.users.split(",");
  const trimmedUsers = [];
  for (const user of users) {
    trimmedUsers.push(user.trim());
  }
  let contest = new Contest({
    duration: req.body.duration,
    users: trimmedUsers,
    ratings: req.body.ratings.split(","),
  });
  let contestLink =
    "Could not create contest. Please try again a few minutes later";
  try {
    const problems = await unsolvedIds(contest);
    contest.problems = problems;
    console.log(problems);
    contestLink = await getContestLink(contest);
  } catch (err) {
    console.log(err);
  }
  res.json(contestLink);
});

module.exports = router;
