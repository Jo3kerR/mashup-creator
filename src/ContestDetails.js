const axios = require("axios");
const Contest = require("../models/Contest");
const Problem = require("../models/Problem");
require("dotenv/config");

const getNewContestNumber = async () => {
  try {
    const lastContests = await Contest.find().sort({ _id: -1 }).limit(1);
    return lastContests[0].contestNumber + 1;
  } catch (e) {
    console.log(e);
  }
};

const getNewContest = async (reqBody) => {
  try {
    const users = reqBody.users;
    const trimmedUsers = [];
    for (const user of users) {
      trimmedUsers.push(user.trim());
    }
    const contest = new Contest({
      duration: reqBody.duration,
      users: trimmedUsers,
      ratings: reqBody.ratings,
    });
    while (contest.ratings.length > 26) {
      contest.ratings.pop();
    }
    contest.contestNumber = await getNewContestNumber();
    return contest;
  } catch (e) {
    console.log(e);
  }
};

const getAllProblems = async () => {
  try {
    return await Problem.find();
  } catch (e) {
    console.log(e);
  }
};

const getAllSolvedProblems = async (users) => {
  try {
    const solvedProblems = [];
    for (const user of users) {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${user}`
      );
      solvedProblems.push(response.data.result);
    }
    return solvedProblems;
  } catch (e) {
    console.log(e);
  }
};

const addAllProblems = (allUnsolvedProblems, problems) => {
  for (const problem of problems) {
    if (problem.rating >= 800 && problem.rating < 3600) {
      allUnsolvedProblems[problem.rating / 100].set(
        problem.name,
        problem.contestId + problem.index
      );
    }
  }
};

const deleteSolvedProblems = (allUnsolvedProblems, solvedProblems) => {
  for (const data of solvedProblems) {
    if (data === undefined || data.length === 0) continue;
    for (const d of data) {
      if (d.verdict === "OK" && d.problem.rating !== undefined) {
        allUnsolvedProblems[d.problem.rating / 100].delete(d.problem.name);
      }
    }
  }
};

const getUnsolvedProblems = async (contest) => {
  try {
    // allUnsolvedProblems contains all unsolved problems from the CF problemset
    const allUnsolvedProblems = new Array(36);
    for (let i = 8; i < allUnsolvedProblems.length; ++i) {
      allUnsolvedProblems[i] = new Map();
    }

    const [problems, solvedProblems] = await Promise.all([
      getAllProblems(),
      getAllSolvedProblems(contest.users),
    ]);

    addAllProblems(allUnsolvedProblems, problems);
    deleteSolvedProblems(allUnsolvedProblems, solvedProblems);

    const contestProblems = [];
    for (const rating of contest.ratings) {
      for (const entry of allUnsolvedProblems[rating / 100].entries()) {
        contestProblems.push(entry[1]);
        allUnsolvedProblems[rating / 100].delete(entry[0]);
        break;
      }
    }
    return contestProblems;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  getUnsolvedProblems,
  getNewContest,
  getNewContestNumber,
};
