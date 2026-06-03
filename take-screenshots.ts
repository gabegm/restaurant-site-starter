/**
 * Screenshot capture script for Restaurant Site Starter Kit.
 * Starts the Eleventy dev server, navigates to each page, and captures screenshots.
 * 
 * Usage: node --experimental-strip-types take-screenshots.ts
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOT_DIR = join(__dirname, "docs", "screenshots");
const BASE_URL = "http://localhost:3000";

// Ensure screenshot directory exists
mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function captureScreenshot(page, filename, options = {}) {
  const path = join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path, ...options });
  console.log(`  ✓ Saved: ${filename}`);
}

async function main() {
  console.log("📸 Capturing screenshots for Restaurant Site Starter Kit...\n");

  // Start Eleventy dev server
  console.log("Starting Eleventy dev server...");
  const server = spawn("npx", ["@11ty/eleventy", "--serve", "--port=3000"], {
    cwd: __dirname,
    stdio: "ignore",
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // Retina quality
  });
  const page = await context.newPage();

  try {
    // 1. Homepage (full page)
    console.log("\n🏠 Homepage...");
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Let images load
    await captureScreenshot(page, "homepage.png", { fullPage: false });

    // 2. Booking Form (scroll to booking section)
    console.log("\n📅 Booking Form...");
    await page.evaluate(() => {
      const el = document.getElementById("booking");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await captureScreenshot(page, "booking.png", { fullPage: false });

    // 3. Order Form (scroll to order section)
    console.log("\n🍕 Order Form...");
    await page.evaluate(() => {
      const el = document.getElementById("order");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await captureScreenshot(page, "order.png", { fullPage: false });

    console.log("\n✅ All screenshots captured!");
    console.log(`   Saved to: ${SCREENSHOT_DIR}\n`);
  } catch (error) {
    console.error("❌ Error capturing screenshots:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
