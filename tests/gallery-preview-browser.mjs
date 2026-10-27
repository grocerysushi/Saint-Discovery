import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:3240/',{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Find a saint whose story stays with you.'}).waitFor();
    await page.waitForFunction(()=>document.querySelector('#home-daily-title')?.textContent !== 'A moment for reflection');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false);
    if ((await page.locator('#home-daily-title').innerText()).includes('Evaristus')) {
      assert.equal(await page.locator('.home-daily-feature img').getAttribute('src'),'/images/evaristus-gallery.jpg');
    }
    assert.equal(await page.getByRole('link',{name:'Take the saint quiz'}).getAttribute('href'),'/quiz');
    assert.equal(await page.getByRole('link',{name:'Today’s reflection'}).getAttribute('href'),'/saint-of-day');
    assert.equal(await page.getByRole('link',{name:'Or explore the saints'}).getAttribute('href'),'/resources');
    await page.close();
  }
  console.log('PASS: desktop and mobile, daily artwork and homepage destinations');
} finally { await browser.close(); }
