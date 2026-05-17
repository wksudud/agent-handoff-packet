# Comparison Notes

AHP v0.1 does not save context primarily by deleting spaces. It saves context by removing repetition and making the handoff contract explicit.

## Common Cost Pattern

Long natural-language handoff:

```text
Please read the whole conversation, remember not to touch runtime data, check the examples, make sure it works, and tell me what changed. Also consider Multica and DeerFlow, but do not publish anything yet.
```

This is readable, but the downstream agent has to infer:

- what is a goal;
- what is a constraint;
- what counts as done;
- what to return;
- when to stop.

Packet-style handoff:

```yaml
goal: Validate all examples.
constraints:
  - Do not touch runtime data.
acceptance:
  - All examples pass validation.
failure_boundary:
  - Stop before publishing externally.
return_required:
  - status
  - changed_paths
  - verification
  - blockers
  - handoff_summary
```

The packet is not always shorter in raw characters, but it is cheaper operationally because later agents do not need to rediscover the structure.

## What Actually Reduces Cost

- Referencing artifacts instead of pasting full files.
- Passing compact summaries instead of full chat history.
- Reusing stable field names across agents.
- Separating human brief, agent packet, and verification report.
- Requiring exact return fields so the scheduler does not ask follow-up questions.

## v0.1 Position

Minified JSON or a future `.ahp` syntax can reduce token count further. That belongs after the packet contract is proven with real examples.
