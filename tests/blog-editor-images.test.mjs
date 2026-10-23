import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { allowedImageSource, downloadArtwork, readLimited, storeArtwork } from '../lib/blog-image-import.mjs';
import { processArtwork, PUBLIC_BASE } from '../lib/blog-image-processing.mjs';

test('remote importer rejects private/untrusted locations and checks every redirect', async () => {
  for (const url of ['http://upload.wikimedia.org/wikipedia/commons/a.jpg','https://127.0.0.1/a','https://www.saintdiscoveryquiz.com/api/blog/admin/posts','https://upload.wikimedia.org.evil.test/wikipedia/commons/a.jpg','https://user:pass@upload.wikimedia.org/wikipedia/commons/a.jpg','https://upload.wikimedia.org:8443/wikipedia/commons/a.jpg','https://example.com/a.jpg','file:///etc/passwd']) assert.equal(allowedImageSource(url), null, url);
  const url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Test.jpg';
  const calls = [];
  await assert.rejects(downloadArtwork(url, async (u, options) => { calls.push(u); assert.equal(options.redirect, 'manual'); return new Response(null,{status:302,headers:{location:'http://169.254.169.254/latest/meta-data'}}); }), /unsupported destination/);
  assert.equal(calls.length, 1);
  await assert.rejects(readLimited(new Response('123456').body,5), /size limit/);
  await assert.rejects(downloadArtwork(url,async()=>new Response('<html>',{headers:{'content-type':'text/html'}})), /did not return an image/);
});

test('stored variants are verified and reused; failed uploads never return an insertable URL', async () => {
  const bytes = await sharp({create:{width:900,height:1200,channels:3,background:'#987'}}).jpeg().toBuffer();
  const objects = new Map(); let writes=0;
  const upload = async (key, data, mime) => { writes++; objects.set(PUBLIC_BASE+key,{data,mime}); return {key,url:PUBLIC_BASE+key}; };
  const request = async (url, options) => { const o=objects.get(url); return o ? new Response(options?.method === 'HEAD'?null:o.data,{headers:{'content-type':o.mime}}) : new Response(null,{status:404}); };
  const image = await storeArtwork(bytes, upload, request);
  assert.equal(image.variants.length,3); assert.equal(writes,4);
  assert(image.src.endsWith('-900.webp')); assert(objects.has(image.receiptUrl));
  await storeArtwork(bytes,upload,request); assert.equal(writes,4,'Identical artwork must not be rewritten');
  await assert.rejects(storeArtwork(bytes,async()=>{throw new Error('Upload unavailable');},async()=>new Response(null,{status:404})), /Upload unavailable/);
  await assert.rejects(storeArtwork(bytes,upload,async()=>new Response('wrong image')), /conflicts/);
  await assert.rejects(processArtwork(Buffer.from('<svg/>')));
});

function routeFixture({ authorized=true, origin=true }={}) {
  const module={exports:{}}; let processed=0, uploads=0;
  const code=ts.transpileModule(fs.readFileSync(new URL('../app/api/blog/admin/images/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,Request,Response,File,Buffer,Uint8Array,
    require: name=>name.includes('blog-server')?{sameOrigin:()=>origin,requireBlogEditor:async()=>authorized?{storage:{from:()=>({upload:async(key)=>{uploads++;return {data:{key,url:PUBLIC_BASE+key}};}})}}:null,blogResponse:(body,status=200)=>Response.json(body,{status})}:{readLimited,downloadArtwork:async()=>{processed++;return Buffer.from('sample');},storeArtwork:async(_bytes,upload)=>{processed++;await upload('test.webp',Buffer.from('test'),'image/webp');return{src:'verified.webp'};}}
  });
  return {post:module.exports.POST,stats:()=>({processed,uploads})};
}
test('image route rejects cross-site and non-editor requests before downloads or uploads',async()=>{
  for(const config of [{origin:false},{authorized:false}]){
    const f=routeFixture(config);
    const r=await f.post(new Request('https://www.saintdiscoveryquiz.com/api/blog/admin/images',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'https://example.com/a.jpg'})}));
    assert.equal(r.status,config.origin===false?403:401); assert.deepEqual(f.stats(),{processed:0,uploads:0});
  }
  const f=routeFixture();
  const r=await f.post(new Request('https://www.saintdiscoveryquiz.com/api/blog/admin/images',{method:'POST',headers:{'content-length':'5000000'}}));
  assert.equal(r.status,413);assert.equal(f.stats().uploads,0);
  const form=new FormData(); form.set('file',new File(['sample'],'test.jpg',{type:'image/jpeg'}));
  const ok=await f.post(new Request('https://www.saintdiscoveryquiz.com/api/blog/admin/images',{method:'POST',body:form}));
  assert.equal(ok.status,200);assert.equal(f.stats().uploads,1);
});

test('editor client preserves multipart headers and retries only after session refresh',async()=>{
  const module={exports:{}};const calls=[];
  const code=ts.transpileModule(fs.readFileSync(new URL('../components/blog/editor-images.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,FormData,File,fetch:async(url,options)=>{calls.push({url,options});return calls.length===1?Response.json({error:'sign in'},{status:401}):url.endsWith('/auth')?Response.json({ok:true}):Response.json({image:{src:'optimized.webp'}});}});
  const image=await module.exports.optimizeEditorImage(new File(['abc'],'x.jpg',{type:'image/jpeg'}),new AbortController().signal);
  assert.equal(image.src,'optimized.webp');assert.equal(calls.length,3);assert.equal(calls[0].options.headers,undefined);
  assert(calls[0].options.body instanceof FormData);assert.equal(calls[1].url,'/api/blog/auth');
});
