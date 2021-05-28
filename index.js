const puppeteer = require('puppeteer');
const fs = require("fs/promises");

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://terraria.fandom.com/wiki/Guide:Getting_started");
	// const handle = await fs.open(`${__dirname + (await (await page.evaluate(() => window.location.pathname)).replace(":", " "))}.html`, "w");
	await fs.mkdir("wiki", {recursive: true});
	const handle = await fs.open(__dirname + "\\wiki\\" + encodeURIComponent((await page.evaluate(() => window.location.pathname)).replace("/wiki/", "")) + ".html", "w");
	console.log(__dirname + "\\wiki\\" + encodeURIComponent((await page.evaluate(() => window.location.pathname)).replace("/wiki/", "")) + ".html");
	await handle.appendFile(await page.content());
	await handle.close();
	await browser.close();
})();