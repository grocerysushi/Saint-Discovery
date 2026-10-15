import fs from 'node:fs';
import sharp from 'sharp';
const plan=JSON.parse(fs.readFileSync('research/saint-artwork/generation-plan-2026-10-15.json','utf8'));
const sheets=[];
for(let offset=36;offset<plan.length;offset+=24){
  const saints=plan.slice(offset,offset+24);
  const tiles=await Promise.all(saints.map(async(saint,index)=>({
    input:await sharp(`public/images/generated-saints/${saint.slug}.webp`).resize(180,240,{fit:'contain',background:'#182b35'}).png().toBuffer(),
    left:(index%6)*180,top:Math.floor(index/6)*240,
  })));
  const path=`research/saint-artwork/preview-${String(sheets.length+3).padStart(2,'0')}.png`;
  await sharp({create:{width:1080,height:Math.ceil(saints.length/6)*240,channels:3,background:'#182b35'}}).composite(tiles).png().toFile(path);
  sheets.push({path,slugs:saints.map(s=>s.slug)});
}
fs.writeFileSync('research/saint-artwork/review-sheets-2026-10-15.json',JSON.stringify(sheets,null,2)+'\n');
console.log(JSON.stringify(sheets.map(s=>({path:s.path,count:s.slugs.length}))));
