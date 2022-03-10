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

async function finalizeContest(page, users, problems, contestLink) {
  await addManagers(page, users, contestLink);
  await addProblems(page, problems, contestLink);
}

module.exports = {
  finalizeContest,
  initializeContest,
};
