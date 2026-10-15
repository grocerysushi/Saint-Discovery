import { chromium } from 'playwright';
import fs from 'node:fs';
const origin = process.env.ARTWORK_BASE_URL || 'http://127.0.0.1:3125';
const browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results = [];
try {
  for (const viewport of [{width:390,height:844},{width:1440,height:1000}]) {
    const context = await browser.newContext({viewport});
    await context.route(/google-analytics|googletagmanager|doubleclick/, route=>route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error=>errors.push(error.message));
    for (const path of ['/resources?q=alexius','/resources?q=anna%20wang','/resources?page=2','/saints/alexius-u-se-yong','/saints/anna-wang','/saints/finnian-of-clonard','/saints/francis-of-assisi','/']) {
      const response = await page.goto(`${origin}${path}`,{waitUntil:'domcontentloaded',timeout:60000});
      await page.locator('main').waitFor();
      const artwork = page.locator('.catalogue-artwork img, .biography-artwork img, .home-daily-feature img');
      const count = await artwork.count();
      for (let i=0;i<count;i++) { await artwork.nth(i).scrollIntoViewIfNeeded(); await artwork.nth(i).evaluate(image=>image.decode()); }
      const images = await artwork.evaluateAll(nodes=>nodes.map(image=>({alt:image.alt,src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight})));
      const placeholders = await page.locator('[data-symbolic="true"]').count();
      if (response.status()!==200 || placeholders || images.some(i=>!i.width || !i.height || i.src.includes('saint-symbolic')) || errors.length) throw Error(`Artwork verification failed: ${path}: ${JSON.stringify({status:response.status(),placeholders,errors,images})}`);
      if (path.includes('alexius') && !await page.getByText(/AI illustration|AI-generated illustration/).count()) throw Error(`Missing AI disclosure: ${path}`);
      results.push({path,viewport,status:response.status(),placeholders,images,errors:[...errors]});
      if (path==='/resources?q=alexius' || path==='/saints/alexius-u-se-yong') await page.screenshot({path:`research/saint-artwork/${path.startsWith('/saints')?'alexius-biography':'alexius-card'}-${viewport.width}.png`,fullPage:false});
    }
    await context.close();
  }
  fs.writeFileSync('research/saint-artwork/pages-2026-10-15.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,results},null,2)+'\n');
  console.log(JSON.stringify({origin,checks:results.length,placeholders:results.reduce((sum,r)=>sum+r.placeholders,0),errors:results.flatMap(r=>r.errors)}));
} finally { await browser.close(); }
