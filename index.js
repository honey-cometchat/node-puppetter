// sudo apt-get update
// curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
// sudo apt-get install -y nodejs
// sudo apt-get install chromium-browser
// npm i -g pm2

const puppeteer = require("puppeteer");

const NO_OF_USERS = process.argv?.[2] ? parseInt(process.argv[2]) : 5;
const NO_OF_MINS = process.argv?.[3] ? parseInt(process.argv[3]) : 5;

const sleep = (sec = 0) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, sec * 1000);
  });
};

(async () => {
  const browser = await puppeteer.launch({
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--no-sandbox",
    ],
    executablePath: "/usr/bin/chromium-browser",
  });
  process.on("SIGTERM", async () => {
    console.info("Closing browser.");
    await browser.close();
    process.exit(0);
  });
  try {
    const pages = [];
    for (let i = 0; i < NO_OF_USERS; i++) {
      const page = await browser.newPage();
      pages.push(page);
      console.info(`Adding user ${i}`);
      await page.goto(
        `https://rtc-test.cometchat.io/?sessionID=v1.eu.2063261e3e1a85eb.bvkf-hnni-emfm&username=user${i}&mode=SPOTLIGHT`,
        { timeout: 0 }
      );
      await sleep(3);
    }
    await sleep(20);
    for (let i = 0; i < NO_OF_MINS * 6; i++) {
      const userIdAudio = Math.floor(Math.random() * (NO_OF_USERS - 1));
      await pages[userIdAudio].click("#audioButton");
      console.info(`Toggled audio for user ${userIdAudio}`);
      await sleep(5);
      const userIdVideo = Math.floor(Math.random() * (NO_OF_USERS - 1));
      await pages[userIdVideo].click("#videoButton");
      console.info(`Toggled video for user ${userIdVideo}`);
      await sleep(5);
    }
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      await page.close();
      await sleep(1);
    }
    console.info("Closing browser.");
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.log(error);
    await browser.close();
    process.exit(0);
  }
})();
