import fs from 'node:fs';
import sharp from 'sharp';
import { loadTs } from '../../tests/load-ts.mjs';
const saints = await loadTs('lib/saints.ts').getAllSaints();
const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
const allAssets = [...new Set(saints.map(s=>getSaintArtwork(s).src))];
const prior = process.argv.includes('--retry') ? JSON.parse(fs.readFileSync('research/saint-artwork/coverage.json','utf8')) : null;
const records=prior ? prior.records.filter(r=>r.status===200) : [];
const assets=allAssets.filter(src=>!records.some(r=>r.src===src));
let index=0;
async function worker() {
 while(index<assets.length) {
  const src=assets[index++];
  if(src.startsWith('/')) {
   try {
    const metadata=await sharp(`public${src}`).metadata();
    if(!metadata.width || !metadata.height)throw Error('Missing image dimensions');
    records.push({src,status:200,local:true,width:metadata.width,height:metadata.height,format:metadata.format});
   }catch(e){records.push({src,status:fs.existsSync(`public${src}`)?0:404,local:true,error:e.message});}
   continue;
  }
  let status=0,error;
  for(let attempt=0;attempt<4;attempt++) {
   try {
    const response=await fetch(src,{method:'HEAD',headers:{'User-Agent':'SaintDiscoveryArtwork/1.0 (https://www.saintdiscoveryquiz.com; artwork availability check)'},signal:AbortSignal.timeout(15000)});
    status=response.status;
    if(status===429) {
      error=JSON.stringify({retryAfter:response.headers.get('retry-after'),server:response.headers.get('server'),cache:response.headers.get('x-cache')});
      await new Promise(resolve=>setTimeout(resolve,Math.min(30000,Math.max(11000,Number(response.headers.get('retry-after')||11)*1000))));
    }
    if(status===200)error=undefined;
    if(status===200 || (status!==429 && status<500))break;
   } catch(e) {error=e.message;}
  }
  records.push({src,status,...(error?{error}:{})});
  await new Promise(resolve=>setTimeout(resolve,350));
  if(records.length%50===0)console.log(`Checked ${records.length}/${assets.length}`);
 }
}
await worker();
const failed=records.filter(r=>r.status!==200);
const assigned=saints.map(s=>({slug:s.slug,name:s.name,...getSaintArtwork(s)}));
fs.writeFileSync('research/saint-artwork/coverage.json',JSON.stringify({checkedAt:new Date().toISOString(),total:saints.length,historical:assigned.filter(x=>!x.generated&&!x.symbolic).length,generated:assigned.filter(x=>x.generated).length,symbolic:assigned.filter(x=>x.symbolic).length,uniqueAssets:allAssets.length,successfulAssets:records.length-failed.length,failed,records},null,2)+'\n');
console.log(JSON.stringify({total:saints.length,uniqueAssets:allAssets.length,failed:failed.length,failureSample:failed.slice(0,8)},null,2));
