import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadTs(relativePath, overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) return overrides[path.basename(file)] ?? JSON.parse(fs.readFileSync(file, 'utf8'));
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule.exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      module: loadedModule, exports: loadedModule.exports, Date, URL,
      require(specifier) {
        const target = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
        return load(path.extname(target) ? target : `${target}.ts`);
      },
    }, { filename: file });
    return loadedModule.exports;
  }
  return load(path.join(root, relativePath));
}
