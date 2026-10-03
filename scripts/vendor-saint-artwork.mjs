// Explicit maintenance command. Keeps source/creator/license metadata intact.
// No cropping, invented likenesses, or runtime scraping. Resized WebP derivatives.
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {loadTs} from '../tests/load-ts.mjs';
const saints=await loadTs('lib/saints.ts').getAllSaints();
const {getSaintArtwork}=loadTs('lib/saint-artwork.ts');
const assets=[...new Set(saints.map(s=>getSaintArtwork(s).src))].filter(src=>src.startsWith('https://'));
if (!assets.length) { console.log('All directory artwork is already local; provenance record preserved.'); process.exit(0); }
const path='lib/data/saint-artwork-local.json';
const manifest=JSON.parse(fs.readFileSync(path,'utf8'));
const recordPath='research/saint-artwork/local-assets-record.json';
const records=fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath,'utf8')).records.filter(r=>r.status===200 && fs.existsSync(`public${r.local}`)) : [];
fs.mkdirSync('public/images/saint-artwork',{recursive:true});
let bytes=records.reduce((sum,r)=>sum+r.outputBytes,0), processed=0;
for(const src of assets){
 let saved=false,error;
 for(let attempt=0;attempt<5;attempt++){
  try{
   const response=await fetch(src,{headers:{'User-Agent':'SaintDiscoveryArtwork/1.0 (https://www.saintdiscoveryquiz.com; reusable artwork preservation)'},signal:AbortSignal.timeout(30000)});
   if(response.status===429){await response.body?.cancel();const retry=Math.max(11,Number(response.headers.get('retry-after')||11));await new Promise(resolve=>setTimeout(resolve,Math.min(retry,30)*1000));continue;}
   if(response.status!==200)throw Error(`HTTP ${response.status}`);
   if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Not an image response');
   const input=Buffer.from(await response.arrayBuffer());
   if(input.length>20_000_000)throw Error('Artwork exceeds preparation size limit');
   const output=await sharp(input,{limitInputPixels:45_000_000}).rotate().resize({width:960,height:960,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();
   const hash=crypto.createHash('sha256').update(src).digest('hex').slice(0,20);
   const local=`/images/saint-artwork/${hash}.webp`;
   fs.writeFileSync(`public${local}`,output);
   manifest[src]=local;
   fs.writeFileSync(`${path}.tmp`,JSON.stringify(manifest,null,2)+'\n');
   fs.renameSync(`${path}.tmp`,path);
   bytes+=output.length;
   records.push({src,local,status:200,sourceSha256:crypto.createHash('sha256').update(input).digest('hex'),sourceBytes:input.length,outputBytes:output.length,modifications:'Orientation respected; resized inside 960px and converted to WebP. No cropping or other retouching.'});
   saved=true;break;
  }catch(e){error=e.message;await new Promise(resolve=>setTimeout(resolve,1000));}
 }
 if(!saved)records.push({src,error:error??'Upstream kept returning 429',status:0});
 processed++;
 if(processed%25===0)console.log(`Bundled ${processed}/${assets.length} new assets; ${(bytes/1e6).toFixed(1)} MB total`);
 await new Promise(resolve=>setTimeout(resolve,350));
}
fs.writeFileSync(recordPath,JSON.stringify({checkedAt:new Date().toISOString(),assets:records.length,saved:records.filter(r=>r.status===200).length,bytes,records},null,2)+'\n');
console.log(JSON.stringify({assets:records.length,saved:records.filter(r=>r.status===200).length,bytes,failed:records.filter(r=>r.status!==200)},null,2));
