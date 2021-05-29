const puppeteer = require('puppeteer');
const fs = require("fs/promises");
// const {exec} = require("child_process");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * PROBLEMS:
 * 1. Link conversion doesn't work when there are query params
 * 2. Those little info boxes still have details from 1.4 (e.g. research needed for journey mode, wrong damage etc.)
 */

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// Choose all of the namespaces you want and change this url to the right one for them and run the program (without wget exec) once for each of them so that they're all in the urls.txt, then you can wget (add in like the main page and some other important pages as well)
	await page.goto("https://terraria.fandom.com/wiki/Special:AllPages?from=&to=&namespace=0");
	// const handle = await fs.open(`${__dirname + (await (await page.evaluate(() => window.location.pathname)).replace(":", " "))}.html`, "w");
	await fs.mkdir("wiki", {recursive: true});
	const url_file_handle = await fs.open("urls.txt", "w");
	let prev_url;
	const journeys_end = new Date("16 May 2020");
	// while((await page.$x("//a[contains(text(), \"Next page\")]")).length > 0) {
	// 	prev_url = page.url();
		const pages = await page.$$(".mw-allpages-chunk li a");
		let urls = [];
		for(let c = 0; c < pages.length; c++) {
			urls.push((await pages[c].getProperty("href"))._remoteObject.value);
		}
		let url_set = new Set();
		let set_size = url_set.size;
		for(let i = 0; i < urls.length; i++) {
			// console.log((await pages[i].getProperty("href"))._remoteObject.value);
			await page.goto(urls[i]);
			url_set.add(page.url().indexOf("#") > -1 ? page.url().substring(0, page.url().indexOf("#")) : page.url());
			if(url_set.size > set_size) {
				const history_url = page.url().indexOf("#") > -1 ? page.url().substring(0, page.url().indexOf("#")) + "?action=history&limit=500" : page.url() + "?action=history&limit=500";
				console.log("Trying to visit: " + history_url);
				await page.goto(history_url);
				const dates = await page.$$(".mw-changeslist-date");
				for(let j = 0; j < dates.length; j++) {
					if(new Date((await dates[j].getProperty("textContent"))._remoteObject.value.substr(7)) < journeys_end) {
						await page.goto((await dates[j].getProperty("href"))._remoteObject.value);
						url_file_handle.appendFile(page.url() + "\n");
						break;
					}
					// console.log((await dates[j].getProperty("textContent"))._remoteObject.value.substr(7));
				}
				set_size++;
			}
			// await pages[i].click();
			// console.log(page.url());
			
		}
	// 	await page.goto(prev_url);
	// 	await page.goto((await (await page.$x("//a[contains(text(), \"Next page\")]"))[0].getProperty("href"))._remoteObject.value);
	// 	// await (await page.$x("//a[contains(text(), \"Next page\")]"))[0].click();
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