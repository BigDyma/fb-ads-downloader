let webdriver = require('selenium-webdriver');

Condition = webdriver.Condition;


const  fbObject = {};

fbObject.business_ids = {
    'uncagex':{
      'bm':626011761607183,
      'act':{
        'uncagex':256739812448184
      }
    },
    'aa':
    {
    'bm': 141765983657101,
    'act': {
      'aa': 394235154522262
    }
    }
 };

fbObject.metrics = [
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

fbObject.map_levels = ["ad_name", "adset_name", "campaign_name,age", "campaign_name,gender", "campaign_name,impression_device", "campaign_name", "campaign_name,days_1", "campaign_name,country"];

fbObject.levels = ["aduri", "adseturi", "varsta", "sex", "dispozitiv", "campanii", "campanii-zile", "campanii-tara"];

fbObject.time_url = "&time_range=2020-02-01_2020-03-13";
fbObject.exportButtonPath = 'export_button';
fbObject.downloadButtonPath = '/html/body/div[5]/div[2]/div/div/div/div/div/div/div[3]/span[2]/div/div[2]/button';
fbObject.elementIsNotPresent = function(locator) {
    return new Condition('for no element to be located ' + locator, function(driver) {
        return driver.findElements(locator).then(function(elements) {
            return elements.length === 0;
        });
    });
};

module.exports = fbObject;