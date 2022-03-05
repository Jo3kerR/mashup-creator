const Contest = require("./models/Contest");
const puppeteer = require("puppeteer");
require("dotenv/config");

async function login(page) {
  try {
    await page.goto("https://codeforces.com/enter", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(500);
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

async function createMashup(page, contestNumber, duration) {
  try {
    await page.goto("https://codeforces.com/mashup/new", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(500);
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
    await page.waitForTimeout(500);
    for (const user of users) {
      await page.click("#addManagerLink");
      await page.type(".handleBox", user);
      await page.click("#addManagerLink");
      await page.click(".ok");
      await page.waitForNavigation({
        waitUntil: "networkidle0",
      });
      await page.waitForTimeout(500);
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
    await page.waitForTimeout(500);
    for (const problem of problems) {
      await page.type('input[name="problemQuery"]', problem);
      await page.click("._MashupContestEditFrame_addProblemLink");
      await page.waitForTimeout(2000);
    }
    await page.click(".submit");
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(500);
  } catch (err) {
    console.log(err);
  }
}

async function getContestLink(contest) {
  try {
    const lastContest = await Contest.find().sort({ _id: -1 }).limit(1);
    contest.contestNumber = lastContest[0].contestNumber + 1;
    await contest.save(); // uncomment when saving to DB
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await login(page);
    await createMashup(page, contest.contestNumber, contest.duration);
    await page.waitForNavigation();
    const contestLink = await page.evaluate(() => window.location.href);
    await addManagers(page, contest.users, contestLink);
    await addProblems(page, contest.problems, contestLink);
    await browser.close();
    return contestLink;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { getContestLink };
