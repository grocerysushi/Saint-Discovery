import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testsDir = path.join(root, "tests");

// Discover all standalone unit test files automatically so newly added tests
// cannot be silently omitted from CI. Build and HTTP tests remain opt-in via
// their dedicated npm scripts (test:seo, test:blog-seo, etc.).
const files = fs
  .readdirSync(testsDir)
  .filter(
    (name) =>
      name.endsWith(".test.mjs") &&
      !name.endsWith("-build.test.mjs") &&
      !name.endsWith("-http.test.mjs")
  )
  .sort()
  .map((name) => path.join("tests", name));

const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: root,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
