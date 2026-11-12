import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// Run against a server the caller has already started. No server or application
// state is created by this script; third-party requests are blocked.
const base = (process.env.NAV_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const chrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const links = [
  ['/quiz', 'Take the quiz'],
  ['/resources', 'Saints directory'],
  ['/patron-saint-of', 'Patron saints'],
  ['/saint-of-day', 'Saint of the day'],
  ['/blog', 'Blog'],
  ['/resources/reading', 'Guided reading'],
  ['/confirmation-saint-guide', 'Confirmation guide'],
  ['/resources/teachers', 'Teachers & catechists'],
];

const browser = await chromium.launch({ headless: true, ...(chrome ? { executablePath: chrome } : {}) });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const origin = new URL(base).origin;
  await context.route('**/*', route => {
    const req = route.request();
    const url = new URL(req.url());
    return url.origin !== origin || !['GET', 'HEAD', 'OPTIONS'].includes(req.method())
      ? route.abort() : route.continue();
  });
  const page = await context.newPage();
  const menu = page.locator('#mobile-nav');
  const trigger = () => page.getByRole('button', { name: 'Explore Saint Discovery' });
  const openMenu = async () => {
    await trigger().click();
    await menu.waitFor({ state: 'visible' });
    assert.equal(await menu.getAttribute('role'), 'dialog', 'the sheet exposes a dialog');
    assert.equal(await menu.getAttribute('aria-modal'), 'true', 'the menu is modal');
  };
  const closedAndFocused = async () => {
    await menu.waitFor({ state: 'hidden' });
    await trigger().waitFor({ state: 'visible' });
    try {
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Explore Saint Discovery', null, { timeout: 5000 });
    } catch (error) {
      console.error('Focus after close:', page.url(), await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 350)));
      throw error;
    }
  };
  const goto = async path => {
    const response = await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    assert.equal(response.status(), 200, `${path} responds successfully`);
    await trigger().waitFor({ state: 'visible' });
  };

  await goto('/');
  await openMenu();
  await page.waitForFunction(() => document.querySelector('#mobile-nav')?.contains(document.activeElement));
  assert.equal(await menu.getByRole('heading', { name: 'Explore', exact: true }).count(), 1);
  const accessibility = await new AxeBuilder({ page }).include('#mobile-nav').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(accessibility.violations.map(({ id }) => id), [], 'the open menu has no WCAG accessibility violations');
  for (const [href, label] of links) {
    const link = menu.locator('a').filter({ has: page.getByText(label, { exact: true }) });
    assert.equal(await link.count(), 1, `one ${label} link`);
    assert.equal(await link.getAttribute('href'), href, `${label} destination`);
  }
  for (let i = 0; i < links.length + 3; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('#mobile-nav')?.contains(document.activeElement)), true, 'focus stays in the dialog');
  }
  await menu.getByRole('button', { name: 'Close menu' }).focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await menu.locator('a[href="/resources/teachers"]').evaluate(el => el === document.activeElement), true, 'reverse tab wraps to the last link');
  await page.keyboard.press('Escape');
  await closedAndFocused();
  await openMenu();
  await menu.getByRole('button', { name: 'Close menu' }).click();
  await closedAndFocused();

  // Follow each actual menu link, verify the destination, sheet closure, and
  // current-page semantics after reopening it on that destination.
  for (const [href, label] of links) {
    await goto('/');
    await openMenu();
    await menu.locator(`a[href="${href}"]`).click();
    await page.waitForURL(url => url.pathname === href);
    await menu.waitFor({ state: 'hidden' });
    if (href === '/quiz') await page.waitForFunction(() => document.activeElement?.id === 'gender-heading');
    await openMenu();
    assert.equal(await menu.locator(`a[href="${href}"]`).getAttribute('aria-current'), 'page', `${label} current page`);
    await page.keyboard.press('Escape');
    await closedAndFocused();
  }
  await goto('/saints/francis-of-assisi');
  await openMenu();
  assert.equal(await menu.locator('a[href="/resources"]').getAttribute('aria-current'), 'location', 'saint biography highlights directory context without claiming the directory is the current page');
  await page.keyboard.press('Escape');

  for (const width of [320, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 667 });
    await goto('/');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${width}px page has no horizontal overflow`);
    await openMenu();
    await page.waitForFunction(() => {
      const rect = document.querySelector('#mobile-nav')?.getBoundingClientRect();
      return rect && rect.left >= -1 && rect.right <= innerWidth + 1;
    });
    const geometry = await menu.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, inner: el.clientWidth, scroll: el.scrollWidth };
    });
    assert(geometry.left >= -1 && geometry.right <= width + 1, `${width}px dialog stays in viewport`);
    assert(geometry.scroll <= geometry.inner + 1, `${width}px dialog has no horizontal overflow`);
    const last = menu.locator('a[href="/resources/teachers"]');
    await last.scrollIntoViewIfNeeded();
    assert.equal(await last.isVisible(), true, `${width}px final link reachable`);
    await page.keyboard.press('Escape');
  }
  console.log(`Mobile navigation checks passed against ${base}`);
  await context.close();
} finally {
  await browser.close();
}
