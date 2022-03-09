const express = require("express");
const router = express.Router();
const Contest = require("./models/Contest");
const {
  initializeContest,
  addManagers,
  addProblems,
  unsolvedIds,
} = require("./createMashup");
const puppeteer = require("puppeteer");

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
  // res.json("DISPLAY");
  const users = req.body.users.split(",");
  const trimmedUsers = [];
  for (const user of users) {
    trimmedUsers.push(user.trim());
  }
  const contest = new Contest({
    duration: req.body.duration,
    users: trimmedUsers,
    ratings: req.body.ratings.split(","),
  });
  while (contest.ratings > 26) {
    contest.ratings.pop();
  }
  const ratingErrorMsg = "Please enter valid rating(s)";
  for (const rating of contest.ratings) {
    if (rating % 100 !== 0 || rating < 800 || rating > 3500) {
      res.json(ratingErrorMsg);
      return;
    }
  }
  const lastContests = await Contest.find().sort({ _id: -1 }).limit(1);
  const newContestNumber = lastContests[0].contestNumber + 1;
  contest.contestNumber = newContestNumber;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    // page.on("dialog", async (dialog) => {
    //   await dialog.accept();
    // });
    const [contestLink, problems] = await Promise.all([
      initializeContest(page, contest),
      unsolvedIds(contest),
      contest.save(),
    ]);
    if (typeof problems === "string") {
      res.json(problems);
      return;
    }
    res.json(contestLink);

    await addManagers(page, contest.users, contestLink);
    await addProblems(page, problems, contestLink);
    await browser.close();
  } catch (err) {
    console.log(err);
    res.json("Could not create contest. Please try again a few minutes later");
  }
});

module.exports = router;
