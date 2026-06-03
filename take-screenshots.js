const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const outputDir = path.join(__dirname, "docs", "screenshots");
  fs.mkdirSync(outputDir, { recursive: true });

  // Screenshot homepage
  await page.goto("file://" + path.join(__dirname, "_site", "index.html"));
  await page.screenshot({ path: path.join(outputDir, "homepage.png"), fullPage: false });
  console.log("Homepage screenshot saved");

  // Screenshot booking form (scroll to booking section)
  await page.evaluate(() => {
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.screenshot({ path: path.join(outputDir, "booking.png"), fullPage: false });
  console.log("Booking form screenshot saved");

  // Screenshot order form (scroll to order section)
  await page.evaluate(() => {
    const el = document.getElementById("order");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.screenshot({ path: path.join(outputDir, "order.png"), fullPage: false });
  console.log("Order form screenshot saved");

  await browser.close();
  console.log("Done!");
})();
