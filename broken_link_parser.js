#!/usr/bin/env node

var 

fs        = require('fs'), 
util      = require('util'),
csv       = require('csv'),
log       = "",
output    = [],
outputLoc = "",
debug     = true

;

var ignoreUrls = [
	'https://www.linkedin.com/company/e-conolight/',
	'https://pinterest.com/pin/create/button/'
];

process.argv.forEach(function (val, index, array) {
    if(!!val && index == 2) {
    	log = val;
    }

    if(!!val && index == 3) {
    	outputLoc = val;
    }
});

function escapeRegExp(string) {
	string.replace(/[.*+?^${}()|[\]i\\]/g, '\\$&');
	return string.replace(/\//g, '\\$&')
}

fs.readFile(log, 'utf8', function(read_error, content) {
	var logs = [];
	if (read_error) return util.error(read_error);

	console.log(content.split(/\n{2}/).length);

	content.split(/\n{2}/).forEach(function(msg, index) {

		var
		amountBroken = 0,
		currentUrl   = "",
		row          = [],
		linkMatchers = {
				currentUrl: /Getting links from:\s([\S]+)/g,
				links: /├─BROKEN─\s(([\S]+)\s\(([\S]+)\)|[\S]+)/gi,
			},
		brokenURL

		;

		if(amountBroken = msg.match(/([1-9]+)\sbroken/)) {
			console.log("===============START===============");
			console.log("Amount Broken: " + parseInt(amountBroken[1]));

			console.log(msg);
			currentUrl = linkMatchers.currentUrl.exec(msg);
			if(currentUrl) {
				currentUrl = currentUrl[1];

				console.log(currentUrl);

				while((brokenURL = linkMatchers.links.exec(msg)) !== null) {
					console.log("Broken URL: ",brokenURL[2]);
					console.log("Status Code: ",brokenURL[3]);
					var ignoredUrl = [];
					ignoreUrls.forEach((ignore) => {
						console.log('/'+escapeRegExp(ignore)+'/');
						ignoredUrl.push(/escapeRegExp(ignore)/.test().toString());
					});
					if (ignoredUrl.indexOf('true') === -1) {
						output.push([currentUrl,brokenURL[2],brokenURL[3]]);
					}
				}
			}
			console.log("===============END==================");
		}
	});

	console.log(output.length);

	csv.stringify(output, function(err, data){
		process.stdout.write(data);

		fs.writeFile(outputLoc, data, function(err){
			if(err){
				util.error(err);
			}
		});
	});
});

