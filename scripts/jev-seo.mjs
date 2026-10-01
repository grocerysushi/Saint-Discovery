import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {SITE,publicUrl,fetchPublic,robotsAllows,extractPage,technicalFindings,candidatesFor,makeRequest,validateEvaluation,editorialFindings,typeSafeRequest,markdownReport} from './lib/jev-seo.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
async function main(){
  const args=process.argv.slice(2),options={limit:6,urls:[],dryRun:false,sitemap:false,check:false};
  for(let i=0;i<args.length;i++){
    const arg=args[i];
    if(arg==='--help'){console.log('Jev SEO: npm run seo:jev -- [--check | --dry-run] [--limit 1..100] [--sitemap] [--url /public-path ...]\nReads TYPESAFE_API_KEY and TYPESAFE_MODEL from environment or ignored .env.jev.local. Saves local Markdown/JSON reports. Makes no site changes.');return;}
    if(arg==='--dry-run')options.dryRun=true;
    else if(arg==='--sitemap')options.sitemap=true;
    else if(arg==='--check')options.check=true;
    else if(arg==='--limit'){options.limit=Number(args[++i]);if(!Number.isInteger(options.limit)||options.limit<1||options.limit>100)throw new Error('Limit must be an integer from 1 to 100.');}
    else if(arg==='--url'){if(!args[i+1])throw new Error('Supply a public URL after --url.');options.urls.push(publicUrl(args[++i]));}
    else throw new Error('Unknown option. Use --help.');
  }
  if(options.check&&(options.dryRun||options.sitemap||options.urls.length))throw new Error('--check cannot be combined with audit options.');
  let local={};try{local=parseEnv(await fs.readFile(path.join(root,'.env.jev.local'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw new Error('Could not read .env.jev.local; check its format.');}
  const apiKey=(process.env.TYPESAFE_API_KEY||local.TYPESAFE_API_KEY||'').trim();
  const model=(process.env.TYPESAFE_MODEL||local.TYPESAFE_MODEL||'jev-latest').trim();
  if(!options.dryRun){
    const discovery=await typeSafeRequest('/v1/models',{apiKey});
    if(!Array.isArray(discovery.models)||!discovery.models.some(m=>m.name===model))throw new Error('Configured model is unavailable to this account. Choose a model listed in the TypeSafe console.');
    if(options.check){console.log(`TypeSafe authentication verified. Model available: ${model}. No page evaluations performed.`);return;}
  }
  const robots=await fetchPublic('/robots.txt');
  if(robots.status!==200&&robots.status!==404)throw new Error('Could not read robots.txt; audit stopped.');
  const robotsText=robots.status===200?robots.text:'';
  let urls=options.urls;
  if(!urls.length){
    urls=['/','/blog','/confirmation-saint-guide','/saint-of-day','/saints/therese-of-lisieux'].map(publicUrl);
    const map=await fetchPublic('/blog/sitemap.xml');
    if(map.status===200){const articles=[...map.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&')).reverse();for(const value of articles){try{const url=publicUrl(value);if(new URL(url).pathname.startsWith('/blog/'))urls.push(url);}catch{/* Omit non-public sitemap entries. */}}}
  }
  if(options.sitemap){
    for(const route of ['/sitemap.xml','/blog/sitemap.xml']){const map=await fetchPublic(route);if(map.status!==200)throw new Error('A site sitemap could not be fetched.');for(const m of map.text.matchAll(/<loc>([^<]+)<\/loc>/g)){try{urls.push(publicUrl(m[1].replaceAll('&amp;','&')));}catch{/* Omit non-public entries. */}}}
  }
  urls=[...new Set(urls)].filter(url=>robotsAllows(robotsText,url)).slice(0,options.limit);
  if(!urls.length)throw new Error('No eligible public URLs found.');
  const report={generatedAt:new Date().toISOString(),site:SITE,mode:options.dryRun?'technical-only':'Jev + technical',model:options.dryRun?null:model,scope:{limit:options.limit,searchConsoleData:false,contentChanges:false},usage:{input_tokens:0,output_tokens:0},pages:[]};
  for(const url of urls){
    try{const fetched=await fetchPublic(url);if(!robotsAllows(robotsText,fetched.url))throw new Error('Redirect target is disallowed by robots.txt.');
      if(!/text\/html/i.test(fetched.headers.get('content-type')??''))throw new Error('Page did not return HTML.');
      const page=extractPage(fetched.text,fetched.url,fetched.status,fetched.headers);page.findings=technicalFindings(page);report.pages.push(page);
    }catch{report.pages.push({url,status:0,title:'',findings:[{kind:'technical',priority:'high',issue:'Public page could not be inspected; check availability, redirects or content type.'}],auditError:'Fetching failed or returned ineligible content; not sent to Jev.'});}
    console.log(`Inspected ${new URL(url).pathname}`);
  }
  const directory=path.join(root,'output/jev-seo',new Date().toISOString().replaceAll(':','-'));
  await fs.mkdir(directory,{recursive:true});
  const save=async()=>{await fs.writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n');await fs.writeFile(path.join(directory,'report.md'),markdownReport(report));};
  await save();
  if(!options.dryRun){
    for(const page of report.pages){
      if(page.status!==200||page.robots?.some(r=>/noindex/i.test(r)))continue;
      const candidates=candidatesFor(page,report.pages.filter(p=>p.text));
      const request=makeRequest({...page,findings:undefined},candidates,model);
      try{const evaluation=validateEvaluation(await typeSafeRequest('/v1/systemone',{apiKey,body:request}),request);
        page.evaluation=evaluation;page.candidates=candidates;page.findings.push(...editorialFindings(evaluation,candidates));
        report.usage.input_tokens+=evaluation.usage.input_tokens;report.usage.output_tokens+=evaluation.usage.output_tokens;
      }catch(e){page.auditError=e.message;await save();throw e;}
      await save();console.log(`Jev evaluated ${new URL(page.url).pathname}`);
    }
  }
  // Duplicate metadata is determined by code, independently of Jev.
  for(const field of ['title','description']){const groups=new Map();for(const page of report.pages.filter(p=>p.status===200)){const value=page[field]?.trim().toLowerCase();if(value)groups.set(value,[...(groups.get(value)??[]),page]);}for(const group of groups.values())if(group.length>1)for(const page of group)page.findings.push({kind:'technical',priority:'medium',issue:`Duplicate ${field} within audited sample; compare ${group.filter(p=>p!==page).map(p=>new URL(p.url).pathname).join(', ')}.`});}
  await save();
  console.log(`Report saved: ${path.relative(root,path.join(directory,'report.md'))}\nAPI input tokens: ${report.usage.input_tokens}; output tokens: ${report.usage.output_tokens}.`);
  if(report.pages.some(p=>p.auditError))process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
