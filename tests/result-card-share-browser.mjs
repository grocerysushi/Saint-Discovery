import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3240';
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: data => data.files?.length === 1 });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
      window.__shareTest = { url: data.url, text: data.text, name: data.files[0].name, type: data.files[0].type };
    } });
  });
  const page = await context.newPage();
  await page.goto(`${origin}/quiz`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Keep analytics off' }).click();
  await page.getByRole('button', { name: 'Male', exact: true }).click();
  for (let i = 0; i < 20; i++) {
    const previous = await page.locator('h1').innerText();
    await page.locator('.option-button').first().click();
    if (i < 19) await page.waitForFunction(value => document.querySelector('h1')?.innerText !== value, previous);
  }
  await page.locator('.result-layout').waitFor();
  await page.getByRole('button', { name: 'Share image and invitation…' }).click();
  await page.waitForFunction(() => window.__shareTest);
  const shared = await page.evaluate(() => window.__shareTest);
  const destination = new URL(shared.url);
  assert.match(destination.pathname, /^\/quiz\/results\/[a-z0-9-]+$/);
  assert.equal(destination.searchParams.get('utm_campaign'), 'quiz_invite');
  assert.equal(destination.searchParams.get('utm_source'), 'reader_share');
  assert.match(shared.text, /^I got /);
  assert.equal(shared.type, 'image/png');
  assert.match(shared.name, /^saint-discovery-[a-z0-9-]+\.png$/);
  await page.getByText('Check that your chosen app includes the link.', { exact: false }).waitFor();
  console.log('PASS: native share receives the result PNG and tracked invitation');
  await context.close();
} finally { await browser.close(); }
