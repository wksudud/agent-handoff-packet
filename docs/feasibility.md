# Feasibility

Date: 2026-05-17

Recommendation: **GO_WITH_SPIKE**

AHP is feasible as a v0.1 public research prototype and handoff-contract proposal. It is not yet proven as a production protocol, a token-reduction mechanism, or a finished AI-native syntax.

## Current Claim Strength

Strong enough to claim:

- AHP makes handoff fields explicit.
- AHP examples can be validated and rendered into human briefs.
- AHP can sit inside existing systems as a payload convention.

Not yet strong enough to claim:

- AHP improves real agent task-completion accuracy.
- AHP reduces token cost for short tasks.
- AHP should become a formal standard.
- AHP should replace MCP, A2A, JSON Schema, Markdown, or issue/comment workflows.

## Evidence So Far

Local mini evaluation:

```text
Cases: 5
Prose required-field accuracy average: 0.70
Packet required-field accuracy average: 1.00
Example pass rate: 5/5
Average token delta, readable packet minus prose: +88.6
Average token delta, compact wire minus prose: +64.4
```

Interpretation:

- The packet structure improved deterministic required-field recognition in this proxy eval.
- Readable packets were longer than short prose.
- The strongest next validation is paired real-agent runs.

## Public Reference Map

| Reference | Relevance |
| --- | --- |
| [Multica docs](https://multica.ai/docs) | Multica describes humans and agents working in one workspace, with issue assignment and agent execution. |
| [How Multica works](https://multica.ai/docs/how-multica-works) | Multica describes server, local daemon, task queue, AI coding tool, and issue lifecycle. |
| [A2A specification](https://a2a-protocol.org/v0.3.0/specification/) | A2A defines Agent Card, Message, Task, Part, Artifact, and structured exchange for interoperable agents. |
| [MCP tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) | MCP tools can return structured content and define output schemas for validation. |
| [OpenAI Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/) | Structured Outputs demonstrates schema-based output control and the value of validated model outputs. |

## Differentiation

AHP should be positioned as:

- a task handoff contract;
- a return contract for delegated agents;
- a human-view / agent-packet / scheduler-translator model;
- a future path toward an AI-native packet syntax.

AHP should not be positioned as:

- a transport protocol;
- a replacement for MCP or A2A;
- a replacement for Markdown, JSON, or YAML in v0.1;
- a proven production standard.

## Risks

- Premature standardization.
- Overclaiming token savings.
- Overlapping with existing structured output and agent protocol efforts.
- Lacking real paired agent benchmark data.

## Next Spikes

- Add mappings to A2A Task/Artifact and MCP tool output.
- Run 20 paired tasks comparing prose-only handoff, readable AHP packet, and compact wire packet.
- Track missing-field rate, clarification count, rework count, verification pass rate, completion time, and token estimate.

## Final Recommendation

Continue as a public draft and invite contributions.

The right near-term message is:

> AHP is a draft handoff contract for multi-agent systems. It makes delegation explicit, verifiable, and translatable. v0.1 uses familiar formats and publishes a small evaluation. The long-term hypothesis is that this may evolve into an AI-native format after real workflow data and model adaptation experiments.
