const puppeteer = require('puppeteer');

const sleep = (sec = 0) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, sec * 1000);
  })
}

(async () => {
    const browser = await puppeteer.launch({
        args: [ '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream' ]
    })
    const pages = [];
    const NO_OF_PAGES = 30;
    for (let i = 0; i < NO_OF_PAGES; i++) {
      const page = await browser.newPage()
      pages.push(page);
      await page.goto(`https://rtc-test.cometchat.io/?sessionID=v1.eu.2063261e3e1a85eb.bvkf-hnni-emfm&username=user${i}&mode=SPOTLIGHT`);
      await sleep(1);
    }
    await sleep(235);
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      await page.close();
      await sleep(1);
    }
    return browser.close();
})()