import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const audit=JSON.parse(await fs.readFile(new URL('../output/seo-improvements/site-audit.json',import.meta.url),'utf8'));
const pages=audit.pages.filter(p=>p.status===200);
const selected=[...pages.filter(p=>!new URL(p.url).pathname.startsWith('/saints/')).map(p=>p.url),
  ...['hildegard-of-bingen','therese-of-lisieux','augustine-of-hippo','teresa-of-avila','francis-of-assisi','john-henry-newman','michael-the-archangel','all-souls'].map(slug=>`https://www.saintdiscoveryquiz.com/saints/${slug}`)].filter(url=>pages.some(p=>p.url===url));
const urls=[...new Set(selected)].slice(0,100);
await fs.writeFile(new URL('../output/seo-improvements/jev-selected-pages.json',import.meta.url),JSON.stringify({selection:'All non-biography sitemap pages plus representative biography types and previously observed popular biographies, bounded at 100 pages.',urls},null,2));
console.log(`Jev will assess ${urls.length} public pages.`);
const child=spawn(process.execPath,['scripts/jev-seo.mjs','--limit',String(urls.length),...urls.flatMap(url=>['--url',url])],{cwd:root,stdio:'inherit',windowsHide:true});
child.on('exit',code=>{process.exitCode=code??1;});
