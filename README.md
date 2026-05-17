<div align="center">

# Agent Handoff Packet

**A pragmatic handoff contract for multi-agent systems.**

[中文 README](README.zh-CN.md) · [Feasibility](docs/feasibility.md) · [Evaluation](docs/evaluation.md) · [Roadmap](docs/roadmap-new-format.md)

</div>

---

Agent Handoff Packet, or **AHP**, is a small research prototype for making agent-to-agent delegation more explicit, auditable, and machine-checkable.

It does not ask teams to abandon Markdown, JSON, YAML, issues, comments, or existing agent protocols in v0.1. Instead, it proposes a contract layer that can sit inside those surfaces:

```text
Human intent -> Scheduler/Translator -> Agent Packet -> Execution Agent -> Verification Packet -> Human Brief
```

The core idea is simple:

```text
Markdown is good for humans.
Schemas are good for tools.
Packets are good for agent handoff.
```

## Why This Exists

Multi-agent workflows often fail for boring reasons:

- the downstream agent misses a constraint;
- acceptance criteria are implied but not stated;
- the reviewer cannot tell whether the task is done;
- agents receive long chat history instead of bounded context;
- the final reply lacks changed paths, evidence, blockers, or assumptions.

AHP turns those hidden expectations into explicit packet fields.

## Project Status

| Area | Status |
| --- | --- |
| Public maturity | v0.1 draft / research prototype |
| Current value | Handoff completeness, validation, and human brief rendering |
| Not yet proven | Real agent task-completion improvement |
| Not claimed | Short-task token reduction or formal standard status |
| Recommendation | GO_WITH_SPIKE |

The current mini evaluation shows better deterministic field recognition, but not lower token cost for short tasks. See [docs/evaluation.md](docs/evaluation.md) and [docs/feasibility.md](docs/feasibility.md).

## Core Roles

### Human View

A readable Markdown brief for users, maintainers, reviewers, and project leads.

### Agent Packet

A compact structured handoff with fields like:

- `goal`
- `constraints`
- `inputs`
- `expected_outputs`
- `acceptance`
- `failure_boundary`
- `return_required`

### Scheduler/Translator Agent

A coordination agent that converts between human intent and agent packets. In a Multica-style workflow, this role is similar to a project lead or scheduler agent. In a planner/executor/reviewer workflow, it can be the planner or orchestrator.

## Example Packet

```yaml
packet_type: handoff
goal: Implement validator examples
target_agent: executor
constraints:
  - Do not modify protected runtime data
inputs:
  - schemas/packet.schema.json
  - examples/
expected_outputs:
  - validator result
  - changed paths
acceptance:
  - Examples validate successfully
failure_boundary:
  - Stop before publishing external resources
return_required:
  - status
  - changed_paths
  - verification
  - blockers
  - handoff_summary
human_brief: >
  Please implement the validator examples and report verification evidence.
```

## Use Cases

### Multi-Agent Coding

Give an execution agent a bounded implementation task with clear files, constraints, acceptance criteria, and required return fields.

### Review And Verification

Require a reviewer agent to return evidence, blockers, assumptions, and a pass/fail summary rather than loose prose.

### Research Delegation

Send a research agent a scoped question with source requirements, uncertainty boundaries, and expected artifacts.

### Project Management Agents

Let a scheduler agent turn issues, comments, or human requests into structured handoffs while still rendering results back into human-readable comments.

### Agent Protocol Payloads

Use AHP as a payload convention inside existing systems such as issue trackers, A2A-style task objects, MCP tool outputs, or custom workflow engines.

## Compatibility Position

AHP is not a replacement for existing protocols.

| System | Relationship |
| --- | --- |
| Markdown / issues / comments | Human-facing surface |
| JSON / YAML | v0.1 source formats |
| JSON Schema | Validation layer |
| MCP | Tool/context/resource protocol where AHP-like packets may appear as structured output |
| A2A | Agent interoperability layer where AHP can be a task payload convention |
| Multica-style workflows | Scheduler/translator plus issue-based dispatch |
| DeerFlow-style workflows | Planner -> executor -> reviewer -> reporter packet chain |

## Quickstart

Clone and run the local checks:

```powershell
npm test
npm run eval
```

Validate specific examples:

```powershell
node tools/validate.js examples/markdown-packet.md examples/yaml-packet.yaml examples/json-packet.json
```

Render a human brief:

```powershell
node tools/render-brief.js examples/markdown-packet.md
```

## Repository Map

```text
docs/
  principles.md             Design principles
  feasibility.md            Feasibility decision and risks
  evaluation.md             Mini evaluation and caveats
  roadmap-new-format.md     Future AI-native syntax direction
examples/
  markdown-packet.md
  yaml-packet.yaml
  json-packet.json
  multica-style.yaml
  deerflow-style.yaml
schemas/
  packet.schema.json
tools/
  validate.js
  render-brief.js
  test.js
  evaluate.js
```

## Evaluation Snapshot

Current local mini evaluation:

```text
Cases: 5
Prose required-field accuracy average: 0.70
Packet required-field accuracy average: 1.00
Example pass rate: 5/5
Average token delta, readable packet minus prose: +88.6
Average token delta, compact wire minus prose: +64.4
```

Interpretation:

- AHP improves deterministic contract completeness in the proxy eval.
- AHP does not currently prove token savings for short prose tasks.
- The next meaningful test is paired real-agent runs.

## Personal View

My personal expectation is that this direction may eventually evolve into a new format designed primarily for AI systems to read, write, patch, and verify.

v0.1 is intentionally not that final format. It is a short, practical sketch: use familiar formats today, collect examples, measure what helps, and let better packet shapes emerge from real multi-agent workflows.

In the long run, AI models could be prompted, fine-tuned, or otherwise adapted to this kind of format so they handle handoff packets more reliably than ad hoc prose. That is a hypothesis and a roadmap, not a claim already proven by this repository.

## Roadmap

Near term:

- collect more real packet examples;
- map AHP fields to A2A Task/Artifact and MCP structured tool output;
- run 20 paired prose-vs-packet handoff tasks;
- track missing-field rate, clarification count, rework count, completion time, and verification pass rate.

Long term:

- experiment with compact wire formats;
- design a possible `.ahp` syntax only after enough examples exist;
- test prompting, instruction tuning, or fine-tuning against the packet format.

## Contributing

This is a short initial idea, not a finished protocol. Useful contributions include:

- real handoff examples;
- stricter or looser schema variants;
- mappings to existing agent systems;
- compact syntax experiments;
- tokenizer-aware wire formats;
- paired benchmarks against ordinary prose handoffs.

## License

MIT
