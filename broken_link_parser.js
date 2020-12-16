import { readFile, createWriteStream } from 'fs';
import csv from 'csv';

class BrokenLinkParser {
	constructor(ignoredUrls) {
		const [c, s, log, output] = process.argv;
		this.logFile = log;
		this.outFile = output;
		this.ignoredUrls = ignoredUrls;
	}

	async parse() {
		try {
			const content = await this.readFile();
			const parsedOutput = await this.parseContent(content.toString());
			this.writeCSV(parsedOutput);
		} catch (e) {
			throw e;
		}
	}

	parseContent(content) {
		return new Promise((resolve, reject) => {
			let outarr = [];

			try {
				content.split(/\n{2}/).map((section) => {
					const numberBroken = section.match(/([1-9]+)\sbroken/);

					if (numberBroken) {
						const currentURL = section.match(/Getting links from:\s([\S]+)/);
						if (currentURL) {
							const brokenLinks = [...section.matchAll(/├─BROKEN─\s(([\S]+)\s\(([\S]+)\)|[\S]+)/gi)];
							outarr = [...outarr, ...this.parseBrokenLinks(currentURL[1], brokenLinks)];
						}
					}
				});

				resolve(outarr);
			} catch (e) {
				reject(e);
			}
		});
	}

	parseBrokenLinks(currentUrl, brokenLinks) {
		return brokenLinks.map((link) => {
			const [m,s, brokenLink, statusCode] = link;
			if (!this.ignoredUrls.includes(brokenLink)) {
				return [currentUrl, brokenLink, statusCode];
			}
		});
	}

	readFile() {
		return new Promise((resolve, reject) => {
			readFile(this.logFile, (err, data) => {
				if (err) {
					reject(err);
				}

				resolve(data);
			});
		});
	}

	writeCSV(parsedOutput) {
		console.log(parsedOutput);
		const stream = csv.stringify(parsedOutput);

		stream.pipe(createWriteStream(this.outFile));
	}
}


const brokenLinksParser = new BrokenLinkParser([
	'https://www.linkedin.com/company/bracelab/',
	'https://bracelab-prod.riversagency.com/clinicians-classroom/index/index'
]);

brokenLinksParser.parse();

