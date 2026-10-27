import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3240';
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  for (const [label, expected] of [['Male', 'Male'], ['Female', 'Female']]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${origin}/quiz`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Keep analytics off' }).click();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.getByRole('heading', { name: 'What is your gender?' }).count(), 1);
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.locator('.option-button').first().click();
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('saint-discovery:quiz-progress:v1') || '{}').answers?.length === 1);
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('saint-discovery:quiz-progress:v1')).gender), expected);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Previous question' }).click();
    await page.getByRole('button', { name: 'Previous question' }).click();
    assert.equal(await page.getByRole('heading', { name: 'What is your gender?' }).count(), 1);
    assert.equal(await page.getByRole('button', { name: label, exact: true }).count(), 1);
    await context.close();
  }
  console.log('PASS: both gender choices survive recovery and backtracking');
} finally { await browser.close(); }
