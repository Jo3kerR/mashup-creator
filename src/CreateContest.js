const waitTime = 2000;

const delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const login = async (page) => {
  try {
    await delay(waitTime);
    await page.goto("https://codeforces.com/enter", {
      waitUntil: "load",
    });
    await page.waitForSelector("#handleOrEmail");
    await page.waitForSelector("#password");
    await page.waitForSelector(".submit");
    await page.type("#handleOrEmail", process.env.HANDLE);
    await page.type("#password", process.env.PASSWORD);
    await page.click(".submit");
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
  } catch (err) {
    console.log(err);
  }
};

const createMashup = async (page, duration, contestNumber) => {
  try {
    await delay(waitTime);
    await page.goto("https://codeforces.com/mashup/new", {
      waitUntil: "load",
    });
    await delay(waitTime);
    await page.waitForSelector("#contestName");
    await page.waitForSelector("#contestDuration");
    await page.waitForSelector('input[value="Create Mashup Contest"]');

    await page.type("#contestName", "Mashup Creator #" + contestNumber);
    await page.type("#contestDuration", duration + "");
    await page.click('input[value="Create Mashup Contest"]');
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    await delay(waitTime);
  } catch (err) {
    console.log(err);
  }
};

const addManagers = async (page, users, contestLink) => {
  try {
    await delay(waitTime);
    await page.goto(contestLink + "/admin", {
      waitUntil: "networkidle0",
    });
    await delay(waitTime);

    await page.waitForSelector("#addManagerLink");

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
};

const addProblems = async (page, problems, contestLink) => {
  try {
    await page.goto(contestLink + "/problems/new", {
      waitUntil: "networkidle0",
    });
    await delay(waitTime);

    for (const problem of problems) {
      await page.waitForSelector('input[name="problemQuery"]');
      await page.waitForSelector("._MashupContestEditFrame_addProblemLink");

      await page.type('input[name="problemQuery"]', problem);
      await page.click("._MashupContestEditFrame_addProblemLink");
      await delay(waitTime);
    }
    await page.click(".submit");
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(waitTime);
    await delay(waitTime);
  } catch (err) {
    console.log(err);
  }
};

const initializeContest = async (page, contest) => {
  try {
    await login(page);
    await createMashup(page, contest.duration, contest.contestNumber);
    await delay(waitTime);
    const contestLink = await page.evaluate(() => window.location.href);
    return contestLink;
  } catch (e) {
    console.log(e);
  }
};

const finalizeContest = async (page, users, problems, contestLink) => {
  try {
    await addManagers(page, users, contestLink);
    await addProblems(page, problems, contestLink);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  finalizeContest,
  initializeContest,
};
