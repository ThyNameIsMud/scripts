import { readFile, writeFile } from 'fs';
import { stringify } from 'csv';

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
			const parsedOutput = this.parseContent(content);
			await this.writeCSV(parsedOutput);
		} catch (e) {
			throw e;
		}

	}

	parseContent(content) {
		return content.split(/\n{2}/).map((section) => {
			const numberBroken = section.match(/([1-9]+)\sbroken/);

			if (numberBroken) {
				const currentURL = section.match(/Getting links from:\s([\S]+)/);
				const brokenLinks = section.matchAll(/├─BROKEN─\s(([\S]+)\s\(([\S]+)\)|[\S]+)/gi);

				return this.parseBrokenLinks(currentURL, brokenLinks);
			}

			return [];
		});
	}

	parseBrokenLinks(currentUrl, brokenLinks) {
		return brokenLinks.map((link) => {
			if (!this.ignoredUrls.includes(link)) {
				const [brokenLink, statusCode] = brokenLinks;
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

	async writeCSV(parsedOutput) {
		const stream = stringify(parsedOutput);

		return new Promise((resolve, reject) => {
			writeFile(this.outFile, stream, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		})
	}
}

const brokenLinksParser = new BrokenLinkParser([
	'https://www.linkedin.com/company/bracelab/',
	'https://bracelab-prod.riversagency.com/clinicians-classroom/index/index'
]);

await brokenLinksParser.parse();
