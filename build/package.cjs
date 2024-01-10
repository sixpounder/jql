/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require("../package.json");
const { cloneDeep } = require("lodash");
const { writeFile } = require("fs");
const { resolve } = require("path");
const { argv } = require("process");

const targetPath = argv[2];
console.info(`Building file ${targetPath}`);

const targetContent = cloneDeep(pkg);
delete targetContent.devDependencies;
delete targetContent.scripts;

writeFile(resolve(targetPath), JSON.stringify(targetContent, null, 2), (err) => {
  if (err) {
    throw err;
  }
});
