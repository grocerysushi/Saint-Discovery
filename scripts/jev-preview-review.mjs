import fs from 'node:fs/promises';
import path from 'node:path';
import {parseEnv} from 'node:util';
import {SITE, extractPage, makeRequest, validateEvaluation, typeSafeRequest} from './lib/jev-seo.mjs';

// Evaluate only the four public patronage pages revised after the site audit.
// Read their production HTML locally; never send build scripts or credentials.
const routes=['african-americans','goldsmiths','italy','the-americas'];
async function main(){
  const local=parseEnv(await fs.readFile('.env.jev.local','utf8'));
  const apiKey=(process.env.TYPESAFE_API_KEY||local.TYPESAFE_API_KEY||'').trim();
  const model=process.env.TYPESAFE_MODEL||local.TYPESAFE_MODEL||'jev-latest';
  const build=process.env.SAINT_BUILD_DIR||'.next-jev-seo';
  const report={generatedAt:new Date().toISOString(),scope:'Four revised patronage pages in local production HTML. Changes have not been deployed.',model,pages:[],usage:{input_tokens:0,output_tokens:0}};
  await fs.mkdir('output/seo-improvements',{recursive:true});
  for(const slug of routes){
    const html=await fs.readFile(path.join(build,'server/app/patron-saint-of',`${slug}.html`),'utf8');
    const page=extractPage(html,`${SITE}/patron-saint-of/${slug}`);
    const request=makeRequest(page,[],model);
    const evaluation=validateEvaluation(await typeSafeRequest('/v1/systemone',{apiKey,body:request}),request);
    report.pages.push({url:page.url,title:page.title,wordCount:page.wordCount,evaluation});
    report.usage.input_tokens+=evaluation.usage.input_tokens;
    report.usage.output_tokens+=evaluation.usage.output_tokens;
    await fs.writeFile('output/seo-improvements/jev-revised-pages.json',JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({slug,sourceSupport:evaluation.answers.source_support}));
  }
}
main().catch(()=>{console.error('Preview review failed; completed public-page evaluations remain saved.');process.exitCode=1;});
