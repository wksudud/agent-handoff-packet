#!/usr/bin/env node
const path = require("path");
const { readPacket, validatePacket } = require("./packet-lib");

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node tools/validate.js <packet-files...>");
  process.exit(2);
}

let failed = false;
for (const file of files) {
  try {
    const packet = readPacket(file);
    const errors = validatePacket(packet);
    if (errors.length > 0) {
      failed = true;
      console.error(`FAIL ${path.basename(file)}`);
      for (const error of errors) console.error(`  - ${error}`);
    } else {
      console.log(`PASS ${path.basename(file)}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${path.basename(file)}`);
    console.error(`  - ${error.message}`);
  }
}

process.exit(failed ? 1 : 0);
