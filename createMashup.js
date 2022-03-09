const axios = require("axios");
require("dotenv/config");

async function unsolvedIds(contest) {
  try {
    // allUnsolvedProblems contains all unsolved problems from the CF problemset
    const allUnsolvedProblems = new Array(36);
    for (let i = 8; i < allUnsolvedProblems.length; ++i) {
      allUnsolvedProblems[i] = new Map();
    }

    // get all problems of given rating
    const response = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );
    const problems = response.data.result.problems;
    for (const problem of problems) {
      if (problem.rating >= 800 && problem.rating < 3600) {
        allUnsolvedProblems[problem.rating / 100].set(
          problem.name,
          problem.contestId + problem.index
        );
      }
    }

    // remove all solved problems
    for (const user of contest.users) {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${user}`
      );
      const data = response.data.result;
      if (data.length === 0) continue;
      for (const d of data) {
        if (d.verdict === "OK" && d.problem.rating !== undefined) {
          allUnsolvedProblems[d.problem.rating / 100].delete(d.problem.name);
        }
      }
    }

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
    console.log(err.response.data.comment);
    return err.response.data.comment;
  }
}

const waitTime = 1000;

async function login(page) {
  try {
    await page.goto("https://codeforces.com/enter", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    await page.type("#handleOrEmail", process.env.HANDLE);
    await page.type("#password", process.env.PASSWORD);
    await page.click(".submit");
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
  } catch (err) {
    console.log(err);
  }
}

async function createMashup(page, duration, contestNumber) {
  try {
    await page.goto("https://codeforces.com/mashup/new", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    await page.type("#contestName", "Mashup Creator #" + contestNumber);
    await page.type("#contestDuration", duration + "");
    await page.click('input[value="Create Mashup Contest"]');
  } catch (err) {
    console.log(err);
  }
}

async function addManagers(page, users, contestLink) {
  try {
    await page.goto(contestLink + "/admin", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    for (const user of users) {
      await page.click("#addManagerLink");
      await page.type(".handleBox", user);
      await page.click("#addManagerLink");
      await page.click(".ok");
      await page.waitForNavigation({
        waitUntil: "networkidle0",
      });
      await page.waitForTimeout(waitTime);
    }
  } catch (err) {
    console.log(err);
  }
}

async function addProblems(page, problems, contestLink) {
  try {
    await page.goto(contestLink + "/problems/new", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    for (const problem of problems) {
      await page.type('input[name="problemQuery"]', problem);
      await page.click("._MashupContestEditFrame_addProblemLink");
      await page.waitForTimeout(1000);
    }
    await page.click(".submit");
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
  } catch (err) {
    console.log(err);
  }
}

async function initializeContest(page, contest) {
  await login(page);
  await createMashup(page, contest.duration, contest.contestNumber);
  await page.waitForNavigation();
  const contestLink = await page.evaluate(() => window.location.href);
  return contestLink;
}

module.exports = {
  unsolvedIds,
  addManagers,
  addProblems,
  initializeContest,
  unsolvedIds,
};
