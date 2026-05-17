# Agent Handoff Packet

Agent Handoff Packet, or AHP, is a pragmatic contract layer for multi-agent workflows.

It does not ask teams to abandon Markdown, JSON, or YAML in v0.1. Instead, it defines the fields and return contract that make handoffs compact, auditable, and easy for agents to execute.

Core thesis:

```text
Human-readable formats are still useful.
Agent-to-agent handoff needs a compact contract.
A scheduler/translator agent connects the two.
```

## Roles

- Human View: a readable Markdown brief for users, reviewers, and maintainers.
- Agent Packet: a structured handoff with goal, constraints, acceptance, failure boundary, and required return fields.
- Scheduler/Translator Agent: converts human intent into packets, routes work, adapts between frameworks, and summarizes results back to humans.

## Quickstart

Validate every example:

```powershell
node tools/test.js
```

Validate specific files:

```powershell
node tools/validate.js examples/*
```

Render a human brief:

```powershell
node tools/render-brief.js examples/markdown-packet.md
```

## v0.1 Packet Contract

AHP v0.1 is syntax-flexible. A packet may be written as Markdown with a fenced packet block, JSON, YAML-like text, or a framework-specific example. The canonical contract is the same:

```yaml
packet_type: handoff
goal: Implement validator examples
target_agent: executor
constraints:
  - Do not modify protected runtime data
inputs:
  - spec/draft.md
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
  Please implement the example validator and report verification evidence.
```

## Compatibility

- Multica-style: M-Pro can act as scheduler/translator, while ContextPacket carries the structured handoff.
- DeerFlow-style: planner creates task packets, executor consumes them, reviewer returns verification packets, and reporter renders the human view.
- MCP/A2A-style systems: AHP can be used as a message payload convention, not as a competing transport protocol.

## Why Not a New Format First?

A future AI-native syntax may be useful, but v0.1 prioritizes adoption and evidence. The first release uses familiar formats and tests whether the contract shape actually improves handoff quality before freezing a new syntax.

See [docs/principles.md](docs/principles.md), [docs/roadmap-new-format.md](docs/roadmap-new-format.md), [docs/comparison-notes.md](docs/comparison-notes.md), [docs/evaluation.md](docs/evaluation.md), and [docs/release-checklist.md](docs/release-checklist.md).
