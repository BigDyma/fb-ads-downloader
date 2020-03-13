const webdriver = require('selenium-webdriver');
const chromedriver = require("selenium-webdriver/chrome");
const chokidar = require('chokidar');
const fs = require('fs');
const path = `${__dirname}/Downloads`
const act_url = "https://business.facebook.com/adsmanager/reporting/view?act=";
const business_url = "&business_id=";
const time_url = "&time_range=2020-02-01_2020-03-13";
const levels = ["aduri", "adseturi", "varsta", "sex", "dispozitiv", "campanii", "campanii-zile", "campanii-tara"];
const map_levels = ["ad_name", "adset_name", "campaign_name,age", "campaign_name,gender", "campaign_name,impression_device", "campaign_name", "campaign_name,days_1", "campaign_name,country"];
let fname = "file.xlsx"
const metrics = [
    'objective',
    'results',
    'cost_per_result',
    'spend',
    'reach',
    'impressions',
    'website_ctr:link_click',
    'actions:link_click',
    'campaign_id',
    'adset_id',
    'ad_id',
    'cpm',
    'cost_per_action_type:link_click',
    'result_rate',
    'account_name',
    'account_id',
    'delivery_start',
    'cost_per_action_type:omni_complete_registration',
    'actions:omni_complete_registration'
]
const business_ids = {
    // 'NAME OF BUSINESS MANAGER HERE': {
    //   'bm': BUSINESS MANAGER ID HERE,
    //   'act': {
    //     'ADD ACCOUNT NAME HERE': ADD ACCOUNT ID HERE
    //   }
};
By = webdriver.By,
until = webdriver.until;
Key = webdriver.Key;
Condition = webdriver.Condition;

until.elementIsNotPresent = function elementIsNotPresent(locator) {
    return new Condition('for no element to be located ' + locator, function(driver) {
        return driver.findElements(locator).then(function(elements) {
            return elements.length === 0;
        });
    });
};

var options = new chromedriver.Options();


// save profile to avoid facebook login
//options.addArguments(`user-data-dir=${process.env.APPDATA}Local\\Google\\Chrome\\User Data\\Profile 1`);

//change default download directory
options.addArgument(`download.default_directory=${path}`);

var watcher = chokidar.watch(`${path}/`, {
    ignored: ["/^\./", `${path}/excels/*`],
    persistent: true
});
watcher
    .on('add', (path) => {
        if (path.split(".").pop() === "xlsx")
            fs.rename(path, `${path}excel\\${fname}`, (err) => {
                if (err) console.log('ERROR: ' + err);
            });
    })
    .on('error', (error) => {
        console.error('Error happened', error);
    })

let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

async function downloadReport(url, fname) {
    try {
        let check = false;
        await driver.get(url);

        const exportButton = driver.wait(
            until.elementLocated(By.xpath('/html/body/div[1]/div/div[2]/div[1]/div/div/div[1]/div[2]/div[1]/div/div[2]/div/div[3]/span/button'))
        );
        (await exportButton).click();
        const downloadButton = driver.wait(
            until.elementLocated(By.xpath('/html/body/div[7]/div[2]/div/div/div/div/div/div/div[3]/span[2]/div/div[2]/button'))
        );
        (await downloadButton).click();
        await driver.wait(until.elementLocated(By.css("div[name='progress']")));
        await driver.wait(until.elementIsNotPresent(By.css("div[name='progress']"), 15000));
    } finally {
        console.log("downloaded")
    }
}

async function makeUrl() {
    let base_url = "";

    for (key in business_ids) {
        const bmid = business_ids[key].bm;
        const bids = business_ids[key];
        const act = bids.act
        for (k in act) {
            for (i in levels) {
                const level = levels[i];
                const map_level = map_levels[i];
                const allmetrics = metrics.join() + time_url;

                base_url = `${act_url}${act[k]}${business_url}${bmid}&event_source=CLICK_EXPORT_TO_ADS_REPORTING&breakdowns=${map_level}&locked_dimensions=0&metrics=${allmetrics}`;
                fname = `${k}-${level}.xlsx`
                await downloadReport(base_url, fname);

            }
        }
    }
}
makeUrl();