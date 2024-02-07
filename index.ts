import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const idLocationMap = {
  panorama: 28,
  outlet: 26,
};

const registerFor = async (name: string, division: "panorama" | "outlet") => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    //resolution: 1920x1080,
  }); // default is true

  const page = await browser.newPage();
  await page.goto("https://gymplius.lt/prisijungti");

  await page.$('input[name="email"]').then(async (input) => {
    await input?.type("spamui.tik@gmail.com", { delay: Math.random() * 150 });
  });

  await page.$('input[name="password"]').then(async (input) => {
    await input?.type(process.env.PASSWORD || "", {
      delay: Math.random() * 150,
    });
  });

  await page.$$eval('button[type="submit"]', (buttons) => {
    buttons.forEach((button) => {
      if (button.innerHTML.toLowerCase().includes("prisijungti")) {
        button.click();
      }
    });
  });

  await page.waitForNavigation({
    waitUntil: "domcontentloaded",
  });

  const url = `https://gymplius.lt/tvarkarastis/?subdivision=${idLocationMap[division]}`;

  // await page.goto("https://gymplius.lt/tvarkarastis/?subdivision=26", {
  await page.goto(url, {
    timeout: 20000,
  });

  await page.waitForSelector("div.workout.no-place");

  await page.$$eval("div.workout", (divs) => {
    const myDiv = Array.from(divs).find(
      (div) =>
        div.innerHTML.toLowerCase().includes(name) &&
        div.innerHTML.toLowerCase().includes("combat") &&
        div.innerHTML.toLowerCase().includes("registr")
    );

    myDiv?.querySelector("button")?.click();
  });
};

const day = new Date().getDay();

if (day === 0 || day === 2) {
  // 0 is Sunday, 2 is Tuesday
  registerFor("kotryna", "outlet");
} else if (day === 3) {
  // 3 is Wednesday
  registerFor("laurynas", "panorama");
} else if (day === 6) {
  // 6 is Saturday
  registerFor("julija", "panorama");
}
