import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
import {SITE,publicUrl,fetchPublic,robotsAllows,extractPage,technicalFindings} from './lib/jev-seo.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'output/seo-improvements');
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value??'';
function walk(n,fn){fn(n);for(const c of n.childNodes??[])walk(c,fn);}
function details(html,url){
  const doc=parse(html),nodes=[];walk(doc,n=>nodes.push(n));
  const meta=key=>nodes.find(n=>n.nodeName==='meta'&&(attr(n,'property')===key||attr(n,'name')===key))?.attrs.find(a=>a.name==='content')?.value??'';
  return {
    ogTitle:meta('og:title'),ogDescription:meta('og:description'),ogUrl:meta('og:url'),ogImage:meta('og:image'),twitterTitle:meta('twitter:title'),twitterDescription:meta('twitter:description'),
    htmlLang:attr(nodes.find(n=>n.nodeName==='html')??{},'lang'),
    images:nodes.filter(n=>n.nodeName==='img').map(n=>({src:attr(n,'src'),alt:attr(n,'alt'),hasAlt:n.attrs.some(a=>a.name==='alt'),width:attr(n,'width'),height:attr(n,'height'),loading:attr(n,'loading')})),
    ids:nodes.filter(n=>attr(n,'id')).map(n=>attr(n,'id')),
    crawlLinks:[...new Set(nodes.filter(n=>n.nodeName==='a').flatMap(n=>{try{const v=new URL(attr(n,'href'),url);return v.origin===SITE&&attr(n,'href')?[v.href]:[];}catch{return [];}}))],
  };
}
async function main(){
  await fs.mkdir(output,{recursive:true});
  const robots=await fetchPublic('/robots.txt');
  if(robots.status!==200)throw new Error('Could not load robots.txt.');
  const urls=[];
  for(const route of ['/sitemap.xml','/blog/sitemap.xml']){
    const map=await fetchPublic(route);if(map.status!==200)throw new Error(`Sitemap failed: ${route}`);
    for(const m of map.text.matchAll(/<loc>([^<]+)<\/loc>/g))urls.push(publicUrl(m[1].replaceAll('&amp;','&')));
  }
  const unique=[...new Set(urls)];if(unique.length>1000)throw new Error('More than 1000 URLs; split the crawl before running.');
  const report={generatedAt:new Date().toISOString(),site:SITE,sitemapEntries:urls.length,uniqueEntries:unique.length,pages:[]};
  let cursor=0;
  const worker=async()=>{while(cursor<unique.length){const index=cursor++,url=unique[index];
    try{if(!robotsAllows(robots.text,url))throw new Error('Blocked by robots.txt.');
      const fetched=await fetchPublic(url);
      const p=extractPage(fetched.text,fetched.url,fetched.status,fetched.headers);
      Object.assign(p,details(fetched.text,fetched.url),{requestedUrl:url});p.findings=technicalFindings(p);
      if(!p.ogTitle||!p.ogDescription||!p.ogImage)p.findings.push({kind:'technical',priority:'medium',issue:'Incomplete social sharing metadata.'});
      if(p.ogUrl&&new URL(p.ogUrl).href!==new URL(p.canonical,p.url).href)p.findings.push({kind:'technical',priority:'medium',issue:'Social URL differs from canonical.'});
      if(p.images.some(i=>!i.hasAlt))p.findings.push({kind:'technical',priority:'medium',issue:'An image is missing its alt attribute.'});
      if(p.images.some(i=>!i.width||!i.height))p.findings.push({kind:'technical',priority:'review',issue:'An image has no intrinsic width/height; inspect layout stability.'});
      if(!p.htmlLang)p.findings.push({kind:'technical',priority:'medium',issue:'Missing document language.'});
      report.pages[index]=p;
    }catch{report.pages[index]={url,requestedUrl:url,status:0,findings:[{kind:'technical',priority:'high',issue:'Fetch failed; inspect this URL manually.'}]};}
    if((index+1)%25===0)console.log(`Inspected ${index+1}/${unique.length} sitemap URLs`);
  }};
  await Promise.all([worker(),worker(),worker()]);
  for(const field of ['title','description']){
    const groups=new Map();for(const p of report.pages){const v=p[field]?.trim().toLowerCase();if(v)groups.set(v,[...(groups.get(v)??[]),p.url]);}
    report[`duplicate${field==='title'?'Titles':'Descriptions'}`]=[...groups].filter(([,v])=>v.length>1).map(([value,pages])=>({value,pages}));
  }
  const byUrl=new Map(report.pages.map(p=>[new URL(p.url).href,p]));
  report.brokenInternalLinks=[];report.missingAnchors=[];report.linksOutsideSitemap=[];
  const linked=new Set();
  for(const p of report.pages)for(const href of p.crawlLinks??[]){
    const u=new URL(href),hash=u.hash;u.hash='';u.search='';const target=byUrl.get(u.href);
    if(target){linked.add(u.href);if(target.status!==200)report.brokenInternalLinks.push({from:p.url,to:href,status:target.status});else if(hash&&!target.ids.includes(decodeURIComponent(hash.slice(1))))report.missingAnchors.push({from:p.url,to:href});}
    else if(!/^\/(?:quiz|api|admin|confirm|subscribed|subscribe|unsubscribe|unsubscribed)(?:\/|$)/.test(u.pathname))report.linksOutsideSitemap.push({from:p.url,to:href});
  }
  report.noIncomingLinks=report.pages.filter(p=>!linked.has(new URL(p.url).href)).map(p=>p.url);
  await fs.writeFile(path.join(output,'site-audit.json'),JSON.stringify(report,null,2)+'\n');
  const counts={pages:report.pages.length,non200:report.pages.filter(p=>p.status!==200).length,noindex:report.pages.filter(p=>p.robots?.some(r=>/noindex/i.test(r))).length,technicalFindings:report.pages.filter(p=>p.findings.length).map(p=>({url:p.url,findings:p.findings})),duplicateTitles:report.duplicateTitles,duplicateDescriptions:report.duplicateDescriptions,brokenInternalLinks:report.brokenInternalLinks,missingAnchors:report.missingAnchors,linksOutsideSitemap:[...new Set(report.linksOutsideSitemap.map(l=>l.to))],noIncomingLinks:report.noIncomingLinks};
  await fs.writeFile(path.join(output,'site-summary.json'),JSON.stringify(counts,null,2)+'\n');
  console.log(JSON.stringify({pages:counts.pages,non200:counts.non200,noindex:counts.noindex,findings:counts.technicalFindings.length,duplicateTitles:counts.duplicateTitles.length,duplicateDescriptions:counts.duplicateDescriptions.length,brokenInternalLinks:counts.brokenInternalLinks.length,missingAnchors:counts.missingAnchors.length,noIncomingLinks:counts.noIncomingLinks.length}));
}
main().catch(()=>{console.error('Site audit failed. No site content was changed.');process.exitCode=1;});
