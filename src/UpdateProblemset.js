const axios = require("axios");
const Problem = require("../models/Problem");
require("dotenv/config");

const updateAllProblems = async () => {
  try {
    const response = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );
    Problem.deleteMany({}, () => {});
    const problems = response.data.result.problems.map((problem) => {
      return {
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating,
      };
    });
    await Problem.create(problems);
  } catch (err) {
    console.log(err.response.data.comment);
  }
};

module.exports = {
  updateAllProblems,
};
