const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");

router.get("/", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ _id: -1 }).limit(10);
    const contestsDto = contests.map((contest) => {
      return {
        contestNumber: contest.contestNumber,
        contestLink: contest.contestLink,
      };
    });
    res.send(contestsDto);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
