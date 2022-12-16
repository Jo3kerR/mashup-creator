const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const { getUnsolvedProblems, getNewContest } = require("./ContestDetails");
const { initializeContest, finalizeContest } = require("./CreateContest");
const { validateRatings, validateUsers } = require("./Validator");
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
<<<<<<< HEAD:src/AppRouter.js
=======
  const contest = await getNewContest(req.body);
  res.send(`${contest.contestNumber}`);

  // validate data
  const [checkRatings, checkUsers] = await Promise.all([
    validateRatings(contest.ratings),
    validateUsers(contest.users),
  ]);
  if (checkUsers !== 1) {
    res.json(checkUsers);
    return;
  }
  if (checkRatings !== 1) {
    res.json(checkRatings);
    return;
  }

>>>>>>> 7e39916fcca37e4ced145a16a8ce185788e91be1:routes.js
  try {
    const contest = await getNewContest(req.body);
    res.send(`${contest.contestNumber}`);
    // validate data
    const [checkRatings, checkUsers] = await Promise.all([
      validateRatings(contest.ratings),
      validateUsers(contest.users),
    ]);
    if (checkUsers !== 1) {
      res.json(checkUsers);
      return;
    }
    if (checkRatings !== 1) {
      res.json(checkRatings);
      return;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // get contest data
    const [contestLink, problems] = await Promise.all([
      initializeContest(page, contest),
      getUnsolvedProblems(contest),
    ]);

    contest.contestLink = contestLink;

    // save contest to db
    await finalizeContest(page, contest.users, problems, contestLink);
    await contest.save();
    await browser.close();
  } catch (err) {
    console.log(err);
    res.json("Could not create contest. Please try again a few minutes later");
  }
});

module.exports = router;
