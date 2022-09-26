// sudo apt-get update
// curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
// sudo apt-get install -y nodejs
// sudo apt-get install chromium-browser
// npm i -g pm2
// git clone https://github.com/honey-cometchat/node-puppetter.git

const puppeteer = require("puppeteer");

let NO_OF_USERS = 5;
let NO_OF_MINS = 60;

process.argv.forEach(arg => {
  if (/^u\d{1,2}$/.test(arg)) {
    NO_OF_USERS = parseInt(arg.replace("u", ""));
  } else if (/^m\d{1,2}$/.test(arg)) {
    NO_OF_MINS = parseInt(arg.replace("m", ""));
  }
});

console.log(`Running for ${NO_OF_USERS} users.`);
console.log(`Running for ${NO_OF_MINS} minutes.`);

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
      // "--use-file-for-fake-video-capture=C:\\Users\\honey\\Desktop\\comet-chat\\puppeter-video-stream\\webcam-video.mjpeg",
      String.raw`--use-file-for-fake-audio-capture=${__dirname}/assets/mic-audio.wav`,
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
        `https://rtc-test.cometchat.io/?sessionID=v1.eu.2063261e3e1a85eb.test2&username=user${i}&mode=SPOTLIGHT&isAudioOnly=true`,
        { timeout: 0 }
      );
      await sleep(3);
    }
    await sleep(20);
    for (let i = 0; i < NO_OF_MINS; i++) {
      const userIdAudio = Math.floor(Math.random() * (NO_OF_USERS - 1));
      await pages[userIdAudio].click("#audioButton");
      console.info(`Toggled audio for user ${userIdAudio}`);
      await sleep(30);
      const userIdVideo = Math.floor(Math.random() * (NO_OF_USERS - 1));
      await pages[userIdVideo].click("#videoButton");
      console.info(`Toggled video for user ${userIdVideo}`);
      await sleep(30);
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
