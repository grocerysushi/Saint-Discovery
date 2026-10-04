import fs from 'node:fs';
const coverage=JSON.parse(fs.readFileSync('research/saint-artwork/coverage.json','utf8'));
const originals=coverage.records.filter(r=>r.src.startsWith('https://upload.wikimedia.org/wikipedia/commons/')&&!r.src.includes('/thumb/'));
const fileFor=src=>`File:${decodeURIComponent(new URL(src).pathname.split('/').at(-1)).replaceAll('_',' ')}`;
const files=[...new Set(originals.map(r=>fileFor(r.src)))];
const info=new Map();
for(let i=0;i<files.length;i+=40){
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',titles:files.slice(i,i+40).join('|'),prop:'imageinfo',iiprop:'url',iiurlwidth:'960'});
 const response=await fetch(url,{headers:{'User-Agent':'SaintDiscoveryArtwork/1.0 (https://www.saintdiscoveryquiz.com; artwork availability check)'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(response.status);
 const data=await response.json();
 for(const page of data.query.pages)if(page.imageinfo?.[0])info.set(page.title.replaceAll('_',' '),page.imageinfo[0]);
}
const out={};
for(const original of originals){const metadata=info.get(fileFor(original.src));if(metadata?.thumburl)out[original.src]=metadata.thumburl.replace(/\?utm_source=.*$/,'');}
fs.writeFileSync('lib/data/saint-artwork-assets.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({originals:originals.length,optimized:Object.keys(out).length}));
