const express = require("express");
const router = express.Router();
const Contest = require("./models/Contest");
const { getUnsolvedProblems, getContest } = require("./contestDetails");
const { initializeContest, finalizeContest } = require("./puppeteerFunctions");
const { validateRatings, validateUsers } = require("./validation");
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
  const contest = await getContest(req.body);

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

  try {
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

    // respond with contest link to avoid heroku 30s timeout
    res.json(contestLink);

    // save contest to db and add problems and users to contest
    await Promise.all([
      contest.save(),
      finalizeContest(page, contest.users, problems, contestLink),
    ]);
    await browser.close();
  } catch (err) {
    console.log(err);
    res.json("Could not create contest. Please try again a few minutes later");
  }
});

module.exports = router;
