#!/usr/bin/env node

const fs     = require('fs');
const util   = require('util');
const csv    = require('csv');
const assert = require('assert');

/*

	Google Analytics CSV Headers
	Transaction ID,Revenue,Tax,Shipping,Quantity

	Orcale CSV Headers
	FIRSTORDER,SOURCEID,CUSTOMERID,ACCOUNTID,ACCOUNTNUMBER,FIRSTORDDT,SOURCE,DigMarkChan,Campaign,MatchLevel,Keycode

	Find missing Orcale SOURCEID in GA Transaction ID
 */

class econoTransactions {
	constructor(config) {
		this.settings         = config;
		this.files            = {};
		this.resources        = {};
		this.missingSourceIDs = [];
		
		this.csvParser = new parseCSV(this.settings.csv);

		this.searchForNulls();
	}

	searchForNulls() {
		this.csvParser.loadFiles()
			.then((files) => {
				this.files = files;

				this.files.oracle.forEach((item) => {
					this.resources.oracle = [];

					this.resources.oracle.push(item[1]);
				});

				this.files.google.forEach((item) => {
					this.resources.google = [];

					this.resources.google.push(item[0]);
				});

				this.resources.oracle.forEach((sourceID) => {
					if(this.resources.google.indexOf(sourceID) < 0) {
						this.missingSourceIDs.push(sourceID);
					}
				});

				console.log("There are", this.missingSourceIDs.length, "missing sourceIDs");
			})
	}
}

class parseCSV {
	constructor(config) {
		this.settings = config;
		this.files = {};
	}
	
	loadFiles() {
		return new Promise((resolve, reject) => {
			let files = {
				google: this.readFile(this.settings.google),
				oracle: this.readFile(this.settings.oracle)
			};

			Promise.all([files.google, files.oracle])
			 	.then((values) => {
			 		let toCSV = {
			 			google: this.runParser(values[0]),
			 			oracle: this.runParser(values[1])
			 		};

			 		Promise.all([toCSV.google, toCSV.oracle])
			 			.then((values) => {
			 				this.files.google = values[0];
			 				this.files.oracle = values[1];

			 				resolve(this.files);
			 			})
			 			.catch((reason) => {
							console.error(reason);
						});
				})
				.catch((reason) => {
					console.error(reason);
				});
		});
	}

	runParser(toCSV) {
		return new Promise((resolve, reject) => {
			try{
				csv.parse(toCSV, (err, data) => {
					assert.ifError(err);

					resolve(data)
				});	
			} catch (err) {
				reject(err);
			}
		});
	}

	readFile(fileCSV) {
		return new Promise((resolve, reject) => {
			try {
				console.log("reading files", fileCSV);
				fs.readFile(fileCSV, 'utf-8', (err, data) => {
					assert.ifError(err);

					resolve(data);
				});	
			} catch (err) {
				reject(err);
			}
		});
	}

}



const econo =  new econoTransactions({
		csv: {
			google: "./GAWebOrders.csv",
			oracle: "./NoGAWebOrders.csv"
		}
	});