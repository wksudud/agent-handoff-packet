#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { readPacket, validatePacket, renderBrief } = require("./packet-lib");

const root = path.resolve(__dirname, "..");
const examplesDir = path.join(root, "examples");
const files = fs
  .readdirSync(examplesDir)
  .filter((name) => /\.(md|json|ya?ml)$/i.test(name))
  .map((name) => path.join(examplesDir, name));

let failed = false;

for (const file of files) {
  try {
    const packet = readPacket(file);
    const errors = validatePacket(packet);
    const brief = renderBrief(packet, path.relative(root, file));
    const requiredBriefSections = [
      "## Goal",
      "## Constraints",
      "## Acceptance",
      "## Failure Boundary",
      "## Return Required",
    ];

    for (const section of requiredBriefSections) {
      if (!brief.includes(section)) {
        errors.push(`rendered brief missing section: ${section}`);
      }
    }

    if (errors.length > 0) {
      failed = true;
      console.error(`FAIL ${path.relative(root, file)}`);
      for (const error of errors) console.error(`  - ${error}`);
    } else {
      console.log(`PASS ${path.relative(root, file)}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${path.relative(root, file)}`);
    console.error(`  - ${error.message}`);
  }
}

const invalidPacket = {
  packet_type: "handoff",
  goal: "This packet intentionally omits failure_boundary.",
  constraints: ["Keep the negative test local."],
  acceptance: ["Validator reports an error."],
  return_required: ["status"],
};
const invalidErrors = validatePacket(invalidPacket);
if (!invalidErrors.some((error) => error.includes("failure_boundary"))) {
  failed = true;
  console.error("FAIL negative validation");
  console.error("  - missing failure_boundary was not reported");
} else {
  console.log("PASS negative validation");
}

if (!failed) {
  console.log(`validated ${files.length} examples and rendered human briefs`);
}

process.exit(failed ? 1 : 0);
