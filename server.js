const webdriver = require('selenium-webdriver');
const chromedriver = require("selenium-webdriver/chrome");
const chokidar = require('chokidar');
const fs = require('fs');
const fbObject = require('./lib');

const static_path = `C:\\Users\\Strelet\\Downloads`;
const act_url = "https://business.facebook.com/adsmanager/reporting/view?act=";
const business_url = "&business_id=";

By = webdriver.By,
until = webdriver.until;
until.elementIsNotPresent = fbObject.elementIsNotPresent;
Key = webdriver.Key;
Condition = webdriver.Condition;

let options = new chromedriver.Options();

// save profile to avoid facebook login
options.addArguments(`user-data-dir=${process.env.APPDATA}Local\\Google\\Chrome\\User Data\\Profile 1`);

// change default download directory

options.addArguments(`download.default_directory=${static_path}`);


// options.addArguments('--headless');

let app = {
    check: true,
    fname: 'error.xlsx'
};

app.watcher = chokidar.watch(`${static_path}/`, {
    ignored: ["/^\./", `${static_path}/excels/*`, `${static_path}/Telegram Desktop/*`],
    persistent: true
});
app.watcher
    .on('add', (path) => {
        // if appear an excel file move it to excels folder
        if (path.split(".").pop() === "xlsx") {
            fs.rename(path, `${static_path}\\excels\\${this.fname}`, (err) => {
                if (err) console.log('ERROR: ' + err);
            });
        }
    })
    .on('error', (error) => {
        console.error('Error happened', error);
    })
      
let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build(); // Build Chrome Webdriver

app.downloadReport = async function(url) {
    try { 

        // await to load the page
        await driver.get(url);

        // driver.takeScreenshot().then(
        //     function(image, err) {
        //         require('fs').writeFile('out.png', image, 'base64', function(err) {
        //             console.log(err);
        //         });
        //     }
        // );
        
        //wait for exportButton to be loaded
        const exportButton = driver.wait(
            until.elementLocated(By.id(fbObject.exportButtonPath))
        );
        this.check = false;

        // if there is no ads in add acount then just skip this account.
        try {
           await driver.wait(
                until.elementLocated(By.xpath("/html/body/div[1]/div/div/div/div/div/div[1]/div[2]/div[2]/div/div[3]/div[1]/div[2]/div/div/div/div/div[2]/div/div/div/div[2]/div/div/div[1]")), 2000
            )
        } catch (error ) {
            this.check = true;
        }
        
        // skip this account 
        if (this.check === false )
        {
            console.log(`campanii in ${this.fname} nu sunt`); 
            return ;
        }
            

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
        console.log(this.fname);
    }
}

app.makeUrl = async function() {
    let base_url = "";
    for (key in fbObject.business_ids) {
        
        const bmid = fbObject.business_ids[key].bm; // bmid - business manager id
        const act = fbObject.business_ids[key].act; // ad account id

       // iterate over ad accounts
        for (k in act) {
            // iterate over exporting data level
            this.check = true;
                for (i in fbObject.levels ) {
                    if (!this.check)
                        break;
                    // current level of data to be exported
                    const level = fbObject.levels[i];
                    const map_level = fbObject.map_levels[i];
                
                    // get metrics to be downloaded with time
                    const allmetrics = fbObject.metrics.join() + fbObject.time_url;

                    // final url
                    base_url = `${act_url}${act[k]}${business_url}${bmid}&event_source=CLICK_EXPORT_TO_ADS_REPORTING&breakdowns=${map_level}&locked_dimensions=0&metrics=${allmetrics}`;
                    
                    // final file name
                    this.fname = `${k}-${level}.xlsx`
                
                // download report
                 console.log(base_url);
                await this.downloadReport(base_url);
            }
            
        }
    }
}

app.makeUrl();