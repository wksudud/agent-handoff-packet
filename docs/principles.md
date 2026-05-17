# Principles

## Contract First

An agent handoff should identify the goal, inputs, constraints, expected outputs, acceptance criteria, failure boundary, and required return fields. The syntax can vary; the contract should not.

## Compact Context

Do not pass full chat history by default. Pass a packet with stable facts, references, and acceptance criteria. Link or reference artifacts instead of pasting everything.

## Human Projection

Packets should render into a human-readable brief. Human readability is a view, not the only source of truth.

## Scheduler/Translator Role

A scheduler/translator agent is responsible for:

- turning human intent into a packet;
- choosing the target agent or workflow lane;
- adapting packet shape between systems;
- checking that return fields are present;
- summarizing results back to humans.

## Flexible Syntax, Stable Fields

v0.1 accepts Markdown, JSON, YAML-like text, and mixed packet blocks. Stability comes from field names and validation, not from forcing one source format too early.

## No Full-History Handoff

Delegated agents should receive the minimum useful context:

- goal;
- constraints;
- relevant artifact references;
- acceptance;
- failure boundary;
- return contract.

If more history is required, the scheduler should summarize it into packet fields.
