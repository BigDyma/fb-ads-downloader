const webdriver = require('selenium-webdriver');
const chromedriver = require("selenium-webdriver/chrome");
const chokidar = require('chokidar');
const fs = require('fs');
const fbObject = require('./lib');

const path = `${__dirname}/Downloads`
const act_url = "https://business.facebook.com/adsmanager/reporting/view?act=";
const business_url = "&business_id=";

By = webdriver.By,
until = webdriver.until;
until.elementIsNotPresent = fbObject.checkelement();
Key = webdriver.Key;
Condition = webdriver.Condition;

let options = new chromedriver.Options();

// save profile to avoid facebook login
// options.addArguments(`user-data-dir=${process.env.APPDATA}Local\\Google\\Chrome\\User Data\\Profile 1`);

// change default download directory
options.addArgument(`download.default_directory=${path}`);

let app = {};

app.fname = "error.xlsx";

app.watcher = chokidar.watch(`${path}/`, {
    ignored: ["/^\./", `${path}/excels/*`],
    persistent: true
});
app.watcher
    .on('add', (path) => {
        if (path.split(".").pop() === "xlsx")
            fs.rename(path, `${path}excel\\${this.fname}`, (err) => {
                if (err) console.log('ERROR: ' + err);
            });
    })
    .on('error', (error) => {
        console.error('Error happened', error);
    })

let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

app.downloadReport = async function(url) {
    try {
        await driver.get(url);
        
        //wait for exportButton to be loaded
        const exportButton = driver.wait(
            until.elementLocated(By.xpath(fbObject.exportButtonPath))
        );

        //Click export Button
        (await exportButton).click();

        //wait for download button to be loaded
        const downloadButton = driver.wait(
            until.elementLocated(By.xpath(fbObject.downloadButtonPath))
        );
        //click download button
        (await downloadButton).click();

        //wait for file
        await driver.wait(until.elementLocated(By.css("div[name='progress']")));
        await driver.wait(until.elementIsNotPresent(By.css("div[name='progress']"), 15000));

    } finally {
        console.log("downloaded", this.fname)
    }
}

app.makeUrl = async function() {
    let base_url = "";

    for (key in fbObject.business_ids) {
        const bmid = fbObject.business_ids[key].bm;
        const bids = fbObject.business_ids[key];
        const act = bids.act
        for (k in act) {
            for (i in fbObject.levels) {
                const level = fbObject.levels[i];
                const map_level = fbObject.map_levels[i];
                const allmetrics = fbObject.metrics.join() + fbObject.time_url;
                base_url = `${act_url}${act[k]}${business_url}${bmid}&event_source=CLICK_EXPORT_TO_ADS_REPORTING&breakdowns=${map_level}&locked_dimensions=0&metrics=${allmetrics}`;
                this.fname = `${k}-${level}.xlsx`
                await downloadReport(base_url);
            }
        }
    }
}

app.makeUrl();