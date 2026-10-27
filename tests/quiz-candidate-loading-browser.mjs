import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3240';
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  let attempts = 0;
  await context.route('**/api/quiz/candidates', route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue();
  });
  const page = await context.newPage();
  await page.goto(`${origin}/quiz`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'The quiz could not load' }).waitFor();
  if (await page.getByRole('button', { name: 'Keep analytics off' }).count()) {
    await page.getByRole('button', { name: 'Keep analytics off' }).click();
    await page.getByRole('heading', { name: 'What is your gender?' }).waitFor();
  } else {
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.getByRole('heading', { name: 'What is your gender?' }).waitFor();
  }
  await page.getByRole('button', { name: 'Male', exact: true }).click();
  await context.setOffline(true);
  for (let i = 0; i < 20; i++) {
    const previous = await page.locator('h1').innerText();
    await page.locator('.option-button').first().click();
    if (i < 19) await page.waitForFunction(value => document.querySelector('h1')?.innerText !== value, previous);
  }
  await page.locator('.result-layout').waitFor();
  assert.equal(attempts, 2);
  console.log('PASS: candidate loading retries and the quiz completes offline after loading');
  await context.close();
} finally { await browser.close(); }
