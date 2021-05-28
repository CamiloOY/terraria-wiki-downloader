const puppeteer = require('puppeteer');
const fs = require("fs/promises");
// const {exec} = require("child_process");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://terraria.fandom.com/wiki/Special:AllPages?from=&to=&namespace=0");
	// const handle = await fs.open(`${__dirname + (await (await page.evaluate(() => window.location.pathname)).replace(":", " "))}.html`, "w");
	await fs.mkdir("wiki", {recursive: true});
	const url_file_handle = await fs.open("urls.txt", "w");
	// while((await page.$x("//a[contains(text(), \"Next page\")]")).length > 0) {
		const pages = await page.$$(".mw-allpages-chunk li a");
		let urls = [];
		for(let c = 0; c < pages.length; c++) {
			urls.push((await pages[c].getProperty("href"))._remoteObject.value);
		}
		for(let i = 0; i < urls.length; i++) {
			// console.log((await pages[i].getProperty("href"))._remoteObject.value);
			await page.goto(urls[i]);
			url_file_handle.appendFile(page.url() + "\n");
			// await pages[i].click();
			// console.log(page.url());
			
		}
	// 	page.$x("//a[contains(text(), \"Next page\")]")[0].click();
	// }
	url_file_handle.close();
	const {stdout, stderr} = await exec(`D: && wget --convert-links -e robots=off --adjust-extension --page-requisites --no-parent --no-clobber --restrict-file-names=windows -U \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36\" --input-file=${__dirname + "\\urls.txt"} -P ${__dirname + "\\wiki"}`);
	console.log("stdout", stdout);
	console.log("stderr", stderr);
	// const handle = await fs.open(__dirname + "\\wiki\\" + encodeURIComponent((await page.evaluate(() => window.location.pathname)).replace("/wiki/", "")) + ".html", "w");
	// console.log(__dirname + "\\wiki\\" + encodeURIComponent((await page.evaluate(() => window.location.pathname)).replace("/wiki/", "")) + ".html");
	// await handle.appendFile(await page.content());
	// await handle.close();
	await browser.close();
})();