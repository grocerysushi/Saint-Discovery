import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup({url='https://www.saintdiscoveryquiz.com/quiz', allowed=true, configured=true}={}) {
  const listeners={}, events=[], errors=[];
  let config, optOuts=0;
  const window={location:{href:url},localStorage:{getItem:()=>null},addEventListener:(name,cb)=>{listeners[name]=cb;}};
  const sdk={init(_token,options){config=options;},capture(name,properties={}){const event=config.before_send({event:name,properties});if(event)events.push(event);return event;},captureException(error){errors.push(error);},opt_out_capturing(){optOuts++;}};
  const loadedModule={exports:{}};
  const source=ts.transpileModule(fs.readFileSync('lib/posthog-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{module:loadedModule,exports:loadedModule.exports,URL,window,process:{env:configured?{NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:'phc_test',NEXT_PUBLIC_POSTHOG_HOST:'https://example.test'}:{}},require(name){if(name==='posthog-js')return sdk;if(name==='./visitor-privacy')return {analyticsAllowed:()=>allowed};throw Error(name);}});
  return {api:loadedModule.exports,window,listeners,events,errors,get config(){return config;},get optOuts(){return optOuts;}};
}

test('PostHog never initializes on excluded hosts, admin, refusals, or missing config',()=>{
  for(const options of [{url:'http://localhost:3000/'},{url:'https://preview.vercel.app/'},{url:'https://www.saintdiscoveryquiz.com/%61dmin/blog'},{allowed:false},{configured:false}]){
    const state=setup(options);assert.equal(state.api.capturePostHog('quiz_complete'),false);state.api.capturePublicError();assert.equal(state.config,undefined);assert.equal(state.errors.length,0);
  }
});
test('eligible events work without GA4; capture has no replay, person profiles, or persistent identifier',()=>{
  const state=setup();assert.equal(state.api.capturePostHog('quiz_complete',{saint_slug:'joseph'}),true);
  assert.equal(state.events[0].event,'quiz_complete');assert.equal(state.config.persistence,'memory');assert.equal(state.config.disable_session_recording,true);assert.equal(state.config.autocapture,false);assert.equal(state.config.person_profiles,'never');
});
test('PostHog removes signed query and fragment data including nested initial URLs but retains UTMs',()=>{
  const state=setup();state.api.initializePostHog();
  const result=state.config.before_send({event:'$pageview',properties:{$current_url:'https://www.saintdiscoveryquiz.com/confirm?token=secret&email=private&utm_source=pinterest#private',$set_once:{$initial_current_url:'https://www.saintdiscoveryquiz.com/?token=secret'}}});
  assert.doesNotMatch(JSON.stringify(result),/secret|private|token=/);assert.match(result.properties.$current_url,/utm_source=pinterest/);
});
test('privacy changes and admin navigation block pageviews, custom events, and error capture',()=>{
  for(const change of [state=>{state.window['ga-disable-G-C75CMC27YN']=true;},state=>{state.window.location.href='https://www.saintdiscoveryquiz.com/admin/blog';},state=>{state.listeners.storage({key:'sd:privacy:v1'});}]){
    const state=setup();state.api.initializePostHog();change(state);
    assert.equal(state.config.before_send({event:'$pageview',properties:{}}),null);assert.equal(state.api.capturePostHog('quiz_complete'),false);state.api.capturePublicError();assert.equal(state.errors.length,0);
  }
});
test('a withdrawn tab does not resume recording after another preference change',()=>{
  const state=setup();state.api.initializePostHog();state.listeners.storage({key:'sd:privacy:v1'});assert.equal(state.optOuts,1);assert.equal(state.api.capturePostHog('quiz_complete'),false);
});

async function connectSrc(env) {
  const loaded={exports:{}};
  const source=ts.transpileModule(fs.readFileSync('next.config.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{module:loaded,exports:loaded.exports,URL,process:{env},__dirname:process.cwd()});
  const csp=(await loaded.exports.default.headers())[0].headers.find(header=>header.key==='Content-Security-Policy').value;
  return csp.split('; ').find(directive=>directive.startsWith('connect-src ')).split(' ');
}
test('the CSP lets the browser reach the configured PostHog proxy origin and nothing broader',async()=>{
  const sources=await connectSrc({NODE_ENV:'production',NEXT_PUBLIC_POSTHOG_HOST:'https://t.saintdiscoveryquiz.com/'});
  assert.ok(sources.includes('https://t.saintdiscoveryquiz.com'));
  assert.ok(!sources.some(source=>/^https:\/\/\*\.saintdiscoveryquiz\.com|^https:$/.test(source)));
  for(const host of [undefined,'','not a url','http://t.saintdiscoveryquiz.com']){
    assert.deepEqual(await connectSrc({NODE_ENV:'production',...(host===undefined?{}:{NEXT_PUBLIC_POSTHOG_HOST:host})}),sources.filter(source=>source!=='https://t.saintdiscoveryquiz.com'));
  }
});
