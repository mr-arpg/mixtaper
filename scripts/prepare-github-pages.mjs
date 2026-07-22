import { copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = ".output/public";
const indexPath = join(publicDir, "index.html");

copyFileSync(indexPath, join(publicDir, "404.html"));
writeFileSync(join(publicDir, ".nojekyll"), "");

console.log("GitHub Pages artifacts ready in .output/public");
