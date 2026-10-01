import fs from 'node:fs/promises';
import {parse} from 'parse5';
import {SITE,extractPage,technicalFindings} from './lib/jev-seo.mjs';

// Fixed local production preview: never inspects admin, email, or result URLs.
const preview='http://127.0.0.1:3130';
const audit=JSON.parse(await fs.readFile('output/seo-improvements/site-audit.json','utf8'));
const routes=audit.pages.map(p=>new URL(p.url).pathname);
const results=[],attr=(node,key)=>node.attrs?.find(a=>a.name===key)?.value??'';
function elements(root){const all=[];const visit=node=>{all.push(node);for(const child of node.childNodes??[])visit(child);};visit(root);return all;}
let cursor=0;
async function worker(){while(cursor<routes.length){
  const index=cursor++,route=routes[index];
  const response=await fetch(preview+route,{headers:{'user-agent':'Twitterbot'},signal:AbortSignal.timeout(30000)});
  const html=await response.text(),page=extractPage(html,SITE+route,response.status,response.headers),nodes=elements(parse(html));
  const meta=name=>attr(nodes.find(n=>n.nodeName==='meta'&&(attr(n,'name')===name||attr(n,'property')===name))??{},'content');
  const findings=technicalFindings(page).filter(f=>f.priority!=='review');
  for(const name of ['og:title','og:description','og:image','twitter:title','twitter:description'])if(!meta(name))findings.push({issue:`Missing ${name}`});
  if(meta('og:url')!==page.canonical)findings.push({issue:'Sharing URL does not match canonical'});
  const links=[...new Set(nodes.filter(n=>n.nodeName==='a').flatMap(n=>{try{const href=new URL(attr(n,'href'),SITE+route);return href.origin===SITE?[href.pathname]:[];}catch{return [];}}))];
  results[index]={route,status:response.status,title:page.title,description:page.description,canonical:page.canonical,findings,links,hasCoverFrame:html.includes('class="blog-cover-frame"')};
  if((index+1)%100===0)console.log(`Verified ${index+1}/${routes.length} preview URLs`);
}}
await Promise.all([worker(),worker(),worker()]);
const known=new Set(routes),extra=[...new Set(results.flatMap(p=>p.links).filter(route=>!known.has(route)&&/^\/(?:saints|blog)\/[a-z0-9-]+$/.test(route)))];
const extraLinks=[];
for(const route of extra){const response=await fetch(preview+route,{signal:AbortSignal.timeout(30000)});await response.body?.cancel();extraLinks.push({route,status:response.status});}
const duplicates=field=>{const groups=new Map();for(const page of results){const value=page[field]?.trim().toLowerCase();if(value)groups.set(value,[...(groups.get(value)??[]),page.route]);}return [...groups.values()].filter(group=>group.length>1);};
const report={generatedAt:new Date().toISOString(),scope:'Local production preview; current production sitemap URLs, not a live deployment.',pages:results.length,failures:results.filter(p=>p.findings.length),duplicateTitles:duplicates('title'),duplicateDescriptions:duplicates('description'),extraLinks,articleCoversReserved:results.filter(p=>p.route.startsWith('/blog/')&&p.hasCoverFrame).length,results};
await fs.writeFile('output/seo-improvements/preview-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:report.pages,failures:report.failures.length,duplicateTitles:report.duplicateTitles.length,duplicateDescriptions:report.duplicateDescriptions.length,extraBrokenLinks:extraLinks.filter(p=>p.status!==200).length,articleCoversReserved:report.articleCoversReserved}));
if(report.failures.length||report.duplicateTitles.length||report.duplicateDescriptions.length||extraLinks.some(p=>p.status!==200))process.exitCode=1;
