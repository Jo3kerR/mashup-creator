const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://tic-tac-toe-455.herokuapp.com/");
  await page.waitForSelector("input[name=username]");
  await page.$eval("input[name=username]", (el) => (el.value = "server bot"));
  await page.click('button[type="submit"]');
  //   await browser.close();
})();
