// Rasterize the shared SVG component into a multi-resolution Windows ICO.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const mod = { exports: {} };
const source = fs.readFileSync(new URL('../components/SiteIcon.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
vm.runInNewContext(compiled, { module: mod, exports: mod.exports, require });
const svg = Buffer.from(renderToStaticMarkup(React.createElement(mod.exports.default, { size: 256 })));
const sizes = [16, 32, 48, 64, 256];
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
for (const [index, image] of images.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index] === 256 ? 0 : sizes[index];
  directory[entry + 1] = directory[entry];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
}
fs.writeFileSync(new URL('../app/favicon.ico', import.meta.url), Buffer.concat([directory, ...images]));
console.log(`Generated favicon.ico: ${sizes.join(', ')} px`);

// Versioned public filenames force browsers to fetch the redesigned icon.
const iconDir = new URL('../public/icons/', import.meta.url);
fs.mkdirSync(iconDir, { recursive: true });
for (const size of [32, 180, 256]) {
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(`saint-discovery-v2-${size}.png`, iconDir)));
}
