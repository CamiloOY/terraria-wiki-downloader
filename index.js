const puppeteer = require('puppeteer');
const fs = require("fs/promises");

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://terraria.fandom.com/wiki/Guide:Getting_started");
	// const handle = await fs.open(`${__dirname + (await (await page.evaluate(() => window.location.pathname)).replace(":", " "))}.html`, "w");
	const handle = await fs.open(`test.html`, "w");
	await handle.appendFile(await page.content());
	await handle.close();
	await browser.close();
})();