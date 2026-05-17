#!/usr/bin/env node
const { readPacket, validatePacket, renderBrief } = require("./packet-lib");

const file = process.argv[2];
if (!file) {
  console.error("usage: node tools/render-brief.js <packet-file>");
  process.exit(2);
}

const packet = readPacket(file);
const errors = validatePacket(packet);
if (errors.length > 0) {
  console.error(`Cannot render invalid packet: ${file}`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

process.stdout.write(renderBrief(packet, file));
