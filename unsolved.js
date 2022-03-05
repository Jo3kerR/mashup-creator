const User = require("./models/User");
const Problem = require("./models/Problem");
const axios = require("axios");

async function updateUsers(users) {
  for (const user of users) {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${user}`
      );
      const data = response.data.result;
      if (data.length === 0) continue;
      const solved = new User({
        handle: user,
        solvedProblems: [],
      });
      const uniqueSubmissions = new Set();
      for (const d of data) {
        if (d.verdict === "OK" && d.problem.rating !== undefined) {
          const solved_obj = {
            rating: d.problem.rating,
            contestId: d.problem.contestId,
            index: d.problem.index,
            name: d.problem.name,
          };
          uniqueSubmissions.add(solved_obj);
        }
      }
      solved.solvedProblems = [...uniqueSubmissions];
      solved.solvedProblems.sort(function (a, b) {
        return a.rating - b.rating;
      });
      await User.deleteOne({ handle: user });
      await solved.save();
    } catch (err) {
      console.log(err);
    }
  }
}

async function unsolvedIds(contest) {
  try {
    // new method
    // no chance of getting solved problems
    // but might never get some problems

    await updateUsers(contest.users);

    // allUnsolvedProblems contains all unsolved problems from the CF problemset
    const allUnsolvedProblems = new Array(36);
    for (let i = 8; i < allUnsolvedProblems.length; ++i) {
      allUnsolvedProblems[i] = new Map();
    }

    // get all problems of given rating
    for (const rating of contest.ratings) {
      if (allUnsolvedProblems[rating / 100].size === 0) {
        const dbEntry = await Problem.findOne({ rating: rating });
        for (const it of dbEntry.problems) {
          allUnsolvedProblems[rating / 100].set(
            it.name,
            it.contestId + it.index
          );
        }
      }
    }

    // remove all solved problems
    for (const user of contest.users) {
      const userSolved = await User.findOne({ handle: user });
      if (userSolved !== null) {
        // can optimize, data is sorted according to rating
        for (const data of userSolved.solvedProblems) {
          if (allUnsolvedProblems[data.rating / 100].size !== 0) {
            allUnsolvedProblems[data.rating / 100].delete(data.name);
          }
        }
      }
    }

    // TODO: if problem is in normal round and special round, remove both
    // like technocup round and contest based on technocup round
    // contest ids are not adjacent
    let newProblems = [];
    for (const rating of contest.ratings) {
      for (const entry of allUnsolvedProblems[rating / 100].entries()) {
        newProblems.push(entry[1]);
        allUnsolvedProblems[rating / 100].delete(entry[0]);
        break;
      }
    }
    return newProblems;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { unsolvedIds };
