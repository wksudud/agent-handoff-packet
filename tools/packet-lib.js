const fs = require("fs");
const path = require("path");

const REQUIRED_FIELDS = [
  "packet_type",
  "goal",
  "constraints",
  "acceptance",
  "failure_boundary",
  "return_required",
];

const ALLOWED_PACKET_TYPES = new Set([
  "handoff",
  "context",
  "task",
  "verification_report",
  "decision_record",
]);

function readPacket(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return JSON.parse(text);
  }

  if (ext === ".md" || ext === ".markdown") {
    const block = extractFencedPacket(text);
    if (!block) {
      throw new Error("Markdown file does not contain a fenced ahp-yaml/yaml/json block.");
    }
    return parseStructuredText(block);
  }

  return parseStructuredText(text);
}

function extractFencedPacket(text) {
  const match = text.match(/```(?:ahp-yaml|yaml|json)\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

function parseStructuredText(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }
  return parseSimpleYaml(trimmed);
}

function parseSimpleYaml(text) {
  const result = {};
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let currentKey = "";
  let foldedKey = "";
  let foldedIndent = 0;
  const folded = [];

  function flushFolded() {
    if (foldedKey) {
      result[foldedKey] = folded.join(" ").replace(/\s+/g, " ").trim();
      foldedKey = "";
      folded.length = 0;
    }
  }

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    if (foldedKey) {
      if (indent >= foldedIndent && !/^[A-Za-z0-9_]+:\s*/.test(line)) {
        folded.push(unquote(line));
        continue;
      }
      flushFolded();
    }

    const itemMatch = line.match(/^-\s+(.*)$/);
    if (itemMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(unquote(itemMatch[1]));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      throw new Error(`Unsupported YAML-like line: ${rawLine}`);
    }

    const key = kv[1];
    const value = kv[2];
    currentKey = key;

    if (value === "") {
      result[key] = [];
    } else if (value === ">") {
      foldedKey = key;
      foldedIndent = indent + 1;
    } else {
      result[key] = unquote(value);
    }
  }

  flushFolded();
  return result;
}

function unquote(value) {
  const text = String(value).trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

function validatePacket(packet) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (packet[field] === undefined || packet[field] === null || packet[field] === "") {
      errors.push(`missing required field: ${field}`);
    }
  }

  for (const field of ["constraints", "acceptance", "failure_boundary", "return_required"]) {
    if (!Array.isArray(packet[field]) || packet[field].length === 0) {
      errors.push(`${field} must be a non-empty array`);
    }
  }

  for (const field of ["packet_type", "goal"]) {
    if (typeof packet[field] !== "string" || packet[field].trim() === "") {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  if (typeof packet.packet_type === "string" && !ALLOWED_PACKET_TYPES.has(packet.packet_type)) {
    errors.push(`packet_type must be one of: ${Array.from(ALLOWED_PACKET_TYPES).join(", ")}`);
  }

  return errors;
}

function renderBrief(packet, source = "") {
  const lines = [];
  lines.push("# Agent Handoff Brief");
  if (source) lines.push("", `Source: ${source}`);
  lines.push("", "## Goal", packet.goal || "");
  if (packet.target_agent) lines.push("", "## Target Agent", packet.target_agent);
  addList(lines, "Constraints", packet.constraints);
  addList(lines, "Inputs", packet.inputs);
  addList(lines, "Expected Outputs", packet.expected_outputs);
  addList(lines, "Acceptance", packet.acceptance);
  addList(lines, "Failure Boundary", packet.failure_boundary);
  addList(lines, "Return Required", packet.return_required);
  if (packet.human_brief) lines.push("", "## Human Brief", packet.human_brief);
  addList(lines, "Notes", packet.notes);
  return `${lines.join("\n")}\n`;
}

function addList(lines, title, values) {
  if (!Array.isArray(values) || values.length === 0) return;
  lines.push("", `## ${title}`);
  for (const value of values) {
    lines.push(`- ${value}`);
  }
}

module.exports = {
  ALLOWED_PACKET_TYPES,
  REQUIRED_FIELDS,
  readPacket,
  validatePacket,
  renderBrief,
};
