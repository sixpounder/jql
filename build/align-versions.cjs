const { resolve } = require("path");
const packageJson = require(resolve("package.json"));
const jsr = require(resolve("jsr.json"));

if (packageJson.version !== jsr.version) {
  console.error(`Versions in package.json (${packageJson.version}) and jsr.json (${jsr.version}) are not the same. Aborting.`);
  process.exit(1);
}