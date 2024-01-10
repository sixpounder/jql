/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require("../package.json");
const { cloneDeep } = require("lodash");
const { writeFileSync } = require("fs");
const { resolve } = require("path");
const { argv } = require("process");

// Generate dist/package.json

const targetPackageJsonPath = resolve(argv[2], "package.json");
console.info(`Building file ${targetPackageJsonPath}`);

const targetContent = cloneDeep(pkg);
delete targetContent.devDependencies;
delete targetContent.scripts;

writeFileSync(resolve(targetPackageJsonPath), JSON.stringify(targetContent, null, 2));
