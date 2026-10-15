import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToString} from 'react-dom/server';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function headerAt(pathname){
 const cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file);
  const loadedModule={exports:{}};cache.set(file,loadedModule.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module:loadedModule,exports:loadedModule.exports,URL,URLSearchParams,require(name){
   if(name==='react')return React;
   if(name==='react/jsx-runtime')return jsx;
   if(name==='next/navigation')return {usePathname:()=>pathname};
   if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
   const target=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);
   return load(path.extname(target)?target:target+(fs.existsSync(target+'.tsx')?'.tsx':'.ts'));
  }},{filename:file});
  return loadedModule.exports;
 }
 return renderToString(React.createElement(load(path.join(root,'components/SiteHeader.tsx')).default));
}

test('root ISR alias and browser root render the same header before hydration',()=>{
 const server=headerAt('/index'),client=headerAt('/');
 assert.equal(server,client);
 assert.match(server,/class="language-switcher notranslate"/);
 assert.match(server,/u=https%3A%2F%2Fwww.saintdiscoveryquiz.com%2F/);
});

test('header translation remains absent from private and unrelated index routes',()=>{
 for(const route of ['/admin/blog','/confirm','/index-other'])assert.doesNotMatch(headerAt(route),/class="language-switcher/);
 assert.match(headerAt('/resources'),/class="language-switcher/);
});
