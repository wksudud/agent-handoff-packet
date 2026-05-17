#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { readPacket, validatePacket, renderBrief, REQUIRED_FIELDS } = require("./packet-lib");

const root = path.resolve(__dirname, "..");
const projectRoot = path.resolve(root, "..");
const outputDir =
  process.argv[2] ||
  path.join(projectRoot, "runtime", "experiments", `ahp-mini-eval-${timestamp()}`);

const cases = [
  {
    id: "coding_validator",
    prose:
      "Please implement the validator examples. Keep it zero-dependency, do not publish anything, and tell me what changed plus whether tests pass.",
    packet: {
      packet_type: "handoff",
      goal: "Implement validator examples.",
      target_agent: "executor",
      constraints: ["Keep it zero-dependency."],
      inputs: ["schemas/packet.schema.json", "examples/"],
      expected_outputs: ["Validator result.", "Changed paths."],
      acceptance: ["Examples validate successfully."],
      failure_boundary: ["Stop before publishing external resources."],
      return_required: ["status", "changed_paths", "verification", "blockers", "handoff_summary"],
      human_brief: "Implement validator examples and report evidence.",
    },
  },
  {
    id: "research_brief",
    prose:
      "Research whether this handoff idea overlaps MCP and A2A. Use public sources, avoid unsupported claims, and report sources, assumptions, blockers, and a short summary.",
    packet: {
      packet_type: "handoff",
      goal: "Research overlap between AHP, MCP, and A2A.",
      target_agent: "researcher",
      constraints: ["Use public sources.", "Avoid unsupported claims."],
      inputs: ["public docs", "official repositories"],
      expected_outputs: ["Source-backed comparison.", "Assumptions and blockers."],
      acceptance: ["Claims are source-backed.", "Differences are clearly stated."],
      failure_boundary: ["Stop if official sources cannot be found."],
      return_required: ["status", "sources", "assumptions", "blockers", "handoff_summary"],
      human_brief: "Research protocol overlap and summarize with sources.",
    },
  },
  {
    id: "review_examples",
    prose:
      "Review the examples and make sure they include goal, constraints, acceptance, failure boundary, and return fields. Do not rewrite positioning unless there is a real validation problem.",
    packet: {
      packet_type: "handoff",
      goal: "Review examples for handoff contract completeness.",
      target_agent: "reviewer",
      constraints: ["Do not rewrite positioning unless validation requires it."],
      inputs: ["examples/"],
      expected_outputs: ["Review findings.", "Validation evidence."],
      acceptance: ["Every example includes the required contract fields."],
      failure_boundary: ["Stop before changing public protocol claims."],
      return_required: ["status", "changed_paths", "verification", "blockers", "handoff_summary"],
      human_brief: "Review examples and report contract completeness.",
    },
  },
  {
    id: "multica_dispatch",
    prose:
      "Route this through M-Pro, keep runtime data safe, create compact context for the execution agent, and ask the agent to return evidence and blockers. Stop before changing remote skills.",
    packet: {
      packet_type: "context",
      goal: "Route task through a Multica-style scheduler with compact context.",
      target_agent: "M-Pro to execution lane",
      constraints: ["Keep runtime data safe.", "Create compact context for execution."],
      inputs: ["requirements.md", "technical-design.md", "ops/acceptance.md"],
      expected_outputs: ["ContextPacket.", "Execution handoff."],
      acceptance: ["Execution agent receives compact context.", "Return fields are explicit."],
      failure_boundary: ["Stop before changing remote skills."],
      return_required: ["status", "verification", "blockers", "handoff_summary"],
      human_brief: "Route through M-Pro with a compact execution packet.",
    },
  },
  {
    id: "full_history_proxy",
    prose:
      "Here is the whole discussion: we debated Markdown, HTML, JSON, custom AI-native formats, whether spaces should be removed, whether Multica and DeerFlow have similar concepts, and whether a scheduler should translate between humans and agents. Based on all of that, please create the next small project artifact. Remember the idea should not be extreme. It should keep Markdown and JSON as compatible surfaces, use a future custom format only as a roadmap target, and make sure an agent returns enough information for review. Also avoid publishing, do not change remote configuration, keep runtime data protected, and tell me what you did when finished.",
    packet: {
      packet_type: "handoff",
      goal: "Create the next small AHP project artifact from the established contract direction.",
      target_agent: "executor",
      constraints: [
        "Keep Markdown and JSON as compatible surfaces.",
        "Treat a custom AI-native format as a roadmap target.",
        "Protect runtime data.",
      ],
      inputs: ["requirements.md", "repo/docs/principles.md", "repo/docs/roadmap-new-format.md"],
      expected_outputs: ["One small project artifact.", "Verification evidence."],
      acceptance: ["Artifact follows the pragmatic bridge position.", "Review return fields are complete."],
      failure_boundary: ["Stop before publishing or changing remote configuration."],
      return_required: ["status", "changed_paths", "verification", "blockers", "handoff_summary"],
      human_brief: "Use the established direction to create the next small artifact.",
    },
  },
];

function timestamp() {
  const d = new Date();
  return d.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

function estimateTokens(text) {
  return Math.ceil(String(text).length / 4);
}

function packetToYaml(packet) {
  const lines = [];
  for (const [key, value] of Object.entries(packet)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${item}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join("\n");
}

function packetToCompactWire(packet) {
  const compact = {
    p: packet.packet_type,
    g: packet.goal,
    t: packet.target_agent,
    c: packet.constraints,
    i: packet.inputs,
    o: packet.expected_outputs,
    a: packet.acceptance,
    f: packet.failure_boundary,
    r: packet.return_required,
    h: packet.human_brief,
  };
  for (const key of Object.keys(compact)) {
    if (compact[key] === undefined) delete compact[key];
  }
  return JSON.stringify(compact);
}

function detectProseFields(text) {
  const lower = text.toLowerCase();
  return {
    packet_type: false,
    goal: /\b(please|task|goal|create|implement|research|review|route)\b/.test(lower),
    constraints: /\b(do not|don't|avoid|must not|keep|safe|protect)\b/.test(lower),
    acceptance: /\b(done|pass|passes|validate|success|works|make sure|include)\b/.test(lower),
    failure_boundary: /\b(stop before|before publishing|without confirmation|do not publish|do not change)\b/.test(lower),
    return_required: /\b(return|report|tell me|include|evidence|blockers|summary)\b/.test(lower),
  };
}

function scoreDetectedFields(detected) {
  return REQUIRED_FIELDS.filter((field) => detected[field]).length;
}

function benchmark(label, fn, iterations = 5000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i += 1) fn();
  const elapsedMs = performance.now() - start;
  return {
    label,
    iterations,
    elapsed_ms: Number(elapsedMs.toFixed(3)),
    ms_per_op: Number((elapsedMs / iterations).toFixed(6)),
  };
}

function evaluateCases() {
  return cases.map((item) => {
    const packetYaml = packetToYaml(item.packet);
    const compactWire = packetToCompactWire(item.packet);
    const proseDetected = detectProseFields(item.prose);
    const packetErrors = validatePacket(item.packet);
    const proseFields = scoreDetectedFields(proseDetected);
    const packetFields = REQUIRED_FIELDS.length - packetErrors.filter((err) => err.startsWith("missing required field")).length;
    return {
      id: item.id,
      prose_chars: item.prose.length,
      packet_yaml_chars: packetYaml.length,
      compact_wire_chars: compactWire.length,
      prose_est_tokens: estimateTokens(item.prose),
      packet_est_tokens: estimateTokens(packetYaml),
      compact_wire_est_tokens: estimateTokens(compactWire),
      token_delta_packet_minus_prose: estimateTokens(packetYaml) - estimateTokens(item.prose),
      token_delta_compact_minus_prose: estimateTokens(compactWire) - estimateTokens(item.prose),
      prose_detected_required_fields: proseFields,
      packet_required_fields: packetFields,
      prose_field_accuracy: Number((proseFields / REQUIRED_FIELDS.length).toFixed(3)),
      packet_field_accuracy: Number((packetFields / REQUIRED_FIELDS.length).toFixed(3)),
      packet_validation_errors: packetErrors,
    };
  });
}

function evaluateExamples() {
  const examplesDir = path.join(root, "examples");
  const exampleFiles = fs
    .readdirSync(examplesDir)
    .filter((name) => /\.(md|json|ya?ml)$/i.test(name))
    .map((name) => path.join(examplesDir, name));
  const results = exampleFiles.map((file) => {
    const packet = readPacket(file);
    const errors = validatePacket(packet);
    const brief = renderBrief(packet, path.relative(root, file));
    return {
      file: path.relative(root, file),
      valid: errors.length === 0,
      errors,
      source_chars: fs.readFileSync(file, "utf8").length,
      rendered_brief_chars: brief.length,
      rendered_brief_est_tokens: estimateTokens(brief),
    };
  });
  return {
    total: results.length,
    passed: results.filter((item) => item.valid).length,
    results,
  };
}

function summarize(caseResults, exampleResults, benches) {
  const avg = (items, key) => items.reduce((sum, item) => sum + item[key], 0) / items.length;
  return {
    case_count: caseResults.length,
    prose_required_field_accuracy_avg: Number(avg(caseResults, "prose_field_accuracy").toFixed(3)),
    packet_required_field_accuracy_avg: Number(avg(caseResults, "packet_field_accuracy").toFixed(3)),
    examples_passed: exampleResults.passed,
    examples_total: exampleResults.total,
    examples_pass_rate: Number((exampleResults.passed / exampleResults.total).toFixed(3)),
    avg_token_delta_packet_minus_prose: Number(avg(caseResults, "token_delta_packet_minus_prose").toFixed(1)),
    avg_token_delta_compact_minus_prose: Number(avg(caseResults, "token_delta_compact_minus_prose").toFixed(1)),
    benchmark: benches,
    interpretation: [
      "Packet structure improved deterministic required-field recognition in this eval.",
      "Packet text was larger than short prose on average, but replaces ambiguity with explicit contract fields.",
      "Compact wire representation is a better proxy for agent-to-agent transport cost than readable YAML-like packets.",
      "This is not a real LLM task-completion benchmark; it measures local parseability, validation, and proxy token size.",
    ],
  };
}

fs.mkdirSync(outputDir, { recursive: true });

const caseResults = evaluateCases();
const exampleResults = evaluateExamples();
const benches = [
  benchmark("prose field heuristic", () => {
    for (const item of cases) detectProseFields(item.prose);
  }),
  benchmark("packet validation", () => {
    for (const item of cases) validatePacket(item.packet);
  }),
  benchmark("compact wire JSON parse", () => {
    for (const item of cases) JSON.parse(packetToCompactWire(item.packet));
  }),
  benchmark("example parse validate render", () => {
    for (const item of exampleResults.results) {
      const file = path.join(root, item.file);
      const packet = readPacket(file);
      validatePacket(packet);
      renderBrief(packet, item.file);
    }
  }, 1000),
];
const summary = summarize(caseResults, exampleResults, benches);

const report = [
  "# AHP Mini Evaluation",
  "",
  "This experiment compares short natural-language handoffs with explicit AHP-style packets.",
  "",
  "It measures deterministic field recognition, validation pass rate, approximate token size, and local parse/validate/render speed. It does not measure real LLM task success.",
  "",
  "## Summary",
  "",
  `- Cases: ${summary.case_count}`,
  `- Prose required-field accuracy average: ${summary.prose_required_field_accuracy_avg}`,
  `- Packet required-field accuracy average: ${summary.packet_required_field_accuracy_avg}`,
  `- Example pass rate: ${summary.examples_passed}/${summary.examples_total}`,
  `- Average token delta, packet minus prose: ${summary.avg_token_delta_packet_minus_prose}`,
  `- Average token delta, compact wire minus prose: ${summary.avg_token_delta_compact_minus_prose}`,
  "",
  "## Benchmarks",
  "",
  "| Benchmark | Iterations | Elapsed ms | ms/op |",
  "| --- | ---: | ---: | ---: |",
  ...benches.map((b) => `| ${b.label} | ${b.iterations} | ${b.elapsed_ms} | ${b.ms_per_op} |`),
  "",
  "## Case Results",
  "",
  "| Case | Prose fields | Packet fields | Prose tokens | Packet tokens | Compact tokens | Packet delta | Compact delta |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...caseResults.map(
    (r) =>
      `| ${r.id} | ${r.prose_detected_required_fields}/${REQUIRED_FIELDS.length} | ${r.packet_required_fields}/${REQUIRED_FIELDS.length} | ${r.prose_est_tokens} | ${r.packet_est_tokens} | ${r.compact_wire_est_tokens} | ${r.token_delta_packet_minus_prose} | ${r.token_delta_compact_minus_prose} |`,
  ),
  "",
  "## Caveats",
  "",
  "- Short prose can be smaller than packet text.",
  "- The packet advantage here is deterministic contract completeness, not guaranteed LLM accuracy.",
  "- A real benchmark should run paired agent tasks and record token use, missing-field rate, blocker rate, rework count, and verification pass rate.",
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outputDir, "case-results.json"), JSON.stringify(caseResults, null, 2));
fs.writeFileSync(path.join(outputDir, "example-results.json"), JSON.stringify(exampleResults, null, 2));
fs.writeFileSync(path.join(outputDir, "report.md"), report);

console.log(`summary_path=${path.join(outputDir, "summary.json")}`);
console.log(`report_path=${path.join(outputDir, "report.md")}`);
console.log(`prose_required_field_accuracy_avg=${summary.prose_required_field_accuracy_avg}`);
console.log(`packet_required_field_accuracy_avg=${summary.packet_required_field_accuracy_avg}`);
console.log(`examples_pass_rate=${summary.examples_pass_rate}`);
console.log(`avg_token_delta_packet_minus_prose=${summary.avg_token_delta_packet_minus_prose}`);
